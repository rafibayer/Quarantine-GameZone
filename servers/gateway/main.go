package main

import (
	"Quarantine-GameZone-441/servers/gateway/gamesessions"
	"Quarantine-GameZone-441/servers/gateway/handlers"
	"Quarantine-GameZone-441/servers/gateway/sessions"
	"encoding/json"

	"errors"
	"log"
	"net/http"
	"net/url"
	"os"
	"sync/atomic"
	"time"

	"github.com/go-redis/redis"
)

// https://docs.google.com/document/d/1sVaCIqW1SOicX7KDhEPr6TF_-ADWCGFz4I0KJB0Vbtw/edit
// Director is a wrapper for a request handler
type Director func(r *http.Request)

// CustomDirector returns a Director
// It balances requests between target URLS using round-robin
// and adds X-user header if the request is authenticated
func CustomDirector(targets []*url.URL, ctx *handlers.HandlerContext) Director {
	var counter int32
	counter = 0

	return func(r *http.Request) {
		targ := targets[int(counter)%len(targets)] // round-robin load balancer
		atomic.AddInt32(&counter, 1)               // ensures counter isn't overwritten by parallel request

		r.Header.Add("X-Forwarded-Host", r.Host)
		r.Host = targ.Host
		r.URL.Host = targ.Host
		r.URL.Scheme = targ.Scheme

		xuser, err := getXUser(r, ctx)
		// add X-user header if we could get the sessionState user
		if err == nil {
			r.Header.Set("X-user", xuser)
		} else {
			log.Printf("no auth: %v\n", err)
		}
	}
}

// getXUser returns a string-encoded json object
// containing the auth user in a request
//  {
//		nickname:  str,
//		sessionID: str
//  }
func getXUser(r *http.Request, ctx *handlers.HandlerContext) (string, error) {

	// check for incoming requests with x-user header
	if len(r.Header.Get("X-user")) > 0 {
		log.Println("removing x-user from client request")
		r.Header.Del("X-user")
	}
	sessState := handlers.SessionState{}
	sessID, err := sessions.GetState(r, ctx.SigningKey, ctx.SessionStore, &sessState)
	if err != nil {
		log.Printf("Error getting session state from request: %v\n", err)
		return "INVALID", errors.New("Invalid session")
	}

	xUser := struct {
		Nickname  string `json:"nickname"`
		SessionID string `json:"sessionID"`
	}{
		sessState.Nickname,
		sessID.String(),
	}

	xUserjson, err := json.Marshal(xUser)
	if err != nil {
		return "INVALID", errors.New("Invalid session")
	}
	return string(xUserjson), nil
}

//main is the main entry point for the server
func main() {

	// if PROD variable is defined, deploy on https (intended for production)
	localDeploy := len(os.Getenv("PROD")) == 0

	// ===HTTPS=== //
	tlscert := os.Getenv("TLSCERT")
	if !localDeploy && len(tlscert) == 0 {
		log.Fatal("No TLS CERT found")
	}

	tlskey := os.Getenv("TLSKEY")
	if !localDeploy && len(tlskey) == 0 {
		log.Fatal("No TLS KEY found")
	}
	// ===HTTPS=== //

	// get enviornment variables
	addr := os.Getenv("ADDR")
	if len(addr) == 0 {
		if localDeploy {
			addr = ":80"
		} else {
			addr = ":443"
		}
	}

	sessionkey := os.Getenv("SESSIONKEY")
	if len(sessionkey) == 0 {
		log.Fatal("No Session Key found")
	}

	redisaddr := os.Getenv("REDISADDR")
	if len(redisaddr) == 0 {
		log.Fatal("No redis addr found")
	}

	// SessionStore connection
	client := redis.NewClient(&redis.Options{
		Addr: redisaddr,
	})
	_, err := client.Ping().Result()
	if err != nil {
		log.Fatalf("error connecting to Redis: %v\n", err)
	}
	defer client.Close()

	sessionStore := sessions.NewRedisStore(client, time.Hour)
	gameSessionStore := gamesessions.NewRedisStore(client, time.Hour)

	handlerContext := handlers.NewHandlerContext(sessionkey, sessionStore, gameSessionStore)

	// summaryProxy := &httputil.ReverseProxy{Director: CustomDirector(summaryAddresses, handlerContext)}
	// messageProxy := &httputil.ReverseProxy{Director: CustomDirector(messageAddresses, handlerContext)}

	mux := http.NewServeMux()

	mux.HandleFunc("/v1/sessions", handlerContext.SessionHandler)
	mux.HandleFunc("/v1/sessions/", handlerContext.SpecificSessionHandler)
	mux.HandleFunc("/v1/games", handlerContext.GameHandler)
	mux.HandleFunc("/v1/games/", handlerContext.SpecificGameHandler)

	// CORS middleware
	wrappedMux := handlers.NewCorsHandler(mux)

	log.Printf("Server is listening at %s", addr)
	if localDeploy {
		log.Println("Deploying using HTTP for local development...")
		log.Fatal(http.ListenAndServe(addr, wrappedMux))
	} else {
		log.Println("Deploying using HTTPS for production...")
		log.Fatal(http.ListenAndServeTLS(addr, tlscert, tlskey, wrappedMux))

	}

}
