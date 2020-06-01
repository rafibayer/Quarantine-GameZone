package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-redis/redis"
)

func main() {

	addr := os.Getenv("ADDR")
	if len(addr) == 0 {
		log.Fatal("No ADDR found")
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

	gameStore := NewRedisStore(client, time.Hour)

	mux := http.NewServeMux()
	mux.HandleFunc("/v1/tictactoe", gameStore.GameHandler)
	mux.HandleFunc("/v1/tictactoe/", gameStore.SpecificGameHandler)

	log.Printf("Server is listening at %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
