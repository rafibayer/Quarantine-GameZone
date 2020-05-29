package main

import (
	"log"
	"net/http"
	"os"
)

func main() {

	addr := os.Getenv("ADDR")
	if len(addr) == 0 {
		log.Fatal("No ADDR found")
	}

	mux := http.NewServeMux()

	log.Fatal(http.ListenAndServe(addr, mux))
}
