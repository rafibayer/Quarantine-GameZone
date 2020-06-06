package main

import (
	"Quarantine-GameZone-441/servers/gateway/gamesessions"
	"Quarantine-GameZone-441/servers/gateway/handlers"
	"Quarantine-GameZone-441/servers/gateway/sessions"

	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-redis/redis"
)

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

	// rabbitAddr := os.Getenv("RABBITADDR")
	// if len(redisaddr) == 0 {
	// 	log.Fatal("No rabbitmq addr found")
	// }
	// rabbitName := os.Getenv("RABBITNAME")
	// if len(redisaddr) == 0 {
	// 	log.Fatal("No rabbitmq name found")
	// }

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

	// RabbitMQ connection
	// conn, err := amqp.Dial(rabbitAddr)
	// if err != nil {
	// 	log.Fatalf("Error connecting to RabbitMQ: %s", err)
	// }
	// defer conn.Close()
	// ch, err := conn.Channel()
	// if err != nil {
	// 	log.Fatalf("Error opening a channel: %s", err)
	// }
	// defer ch.Close()
	// q, err := ch.QueueDeclare(
	// 	rabbitName, //name
	// 	true,       //durable
	// 	false,      //autoDelete
	// 	false,      //exclusive
	// 	false,      //noWait
	// 	nil)        //args
	// if err != nil {
	// 	log.Fatalf("Error declaring a queue: %s", err)
	// }
	// msgs, err := ch.Consume(
	// 	q.Name, //queue
	// 	"",     //consumer
	// 	false,  //autoAck
	// 	false,  //exclusive
	// 	false,  //noLocal
	// 	false,  //noWait
	// 	nil)    //args
	// if err != nil {
	// 	log.Fatalf("Error when setting up consumer: %s", err)
	// }

	handlerContext := handlers.NewHandlerContext(sessionkey, sessionStore, gameSessionStore)

	//go handlerContext.Notifier.WriteToConnections(msgs)

	// summaryProxy := &httputil.ReverseProxy{Director: CustomDirector(summaryAddresses, handlerContext)}
	// messageProxy := &httputil.ReverseProxy{Director: CustomDirector(messageAddresses, handlerContext)}

	mux := http.NewServeMux()

	mux.HandleFunc("/v1/sessions", handlerContext.SessionHandler)
	mux.HandleFunc("/v1/sessions/", handlerContext.SpecificSessionHandler)

	//mux.HandleFunc("/ws", handlerContext.WsHandler)
	mux.HandleFunc("/v1/gamelobby", handlerContext.LobbyHandler)
	mux.HandleFunc("/v1/gamelobby/", handlerContext.SpecificLobbyHandler)
	mux.HandleFunc("/v1/games/", handlerContext.SpecificGameHandler)

	// CORS middleware
	wrappedMux := handlers.NewCorsHandler(mux)

	log.Printf("Server is listening at %s", addr)
	if localDeploy {
		log.Println("Deploying using HTTP for development...")
		log.Fatal(http.ListenAndServe(addr, wrappedMux))
	} else {
		log.Println("Deploying using HTTPS for production...")
		log.Fatal(http.ListenAndServeTLS(addr, tlscert, tlskey, wrappedMux))

	}

}
