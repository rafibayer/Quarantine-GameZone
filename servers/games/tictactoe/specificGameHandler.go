package main

import (
	"encoding/json"
	"log"
	"net/http"
	"path"
	"strings"
)

// SpecificGameHandlerGet is used to get the state of a specific game
func (gameStore *RedisStore) SpecificGameHandlerGet(w http.ResponseWriter, r *http.Request) {
	log.Println("Call went to SpecificGameHandler Get")

	// get gameID from request URL
	resource := r.URL.Path
	id := path.Base(resource)
	log.Println("id: " + id)

	game := TicTacToe{}
	err := gameStore.Get(GameID(id), game)
	if err != nil {
		log.Println("error: " + err.Error())
		http.Error(w, "Error retrieving gamestate", http.StatusNotFound)
		return
	}

	log.Printf("gamestate: %+v", game)

	// Return updated gamestate to requester
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder := json.NewEncoder(w)
	err = encoder.Encode(game)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

}

// SpecificGameHandlerPost is used to send moves to a specific game
func (gameStore *RedisStore) SpecificGameHandlerPost(w http.ResponseWriter, r *http.Request) {
	log.Println("Call went to SpecificGameHandler post")

	// Content JSON
	if r.Header.Get("Content-Type") != "application/json" {
		http.Error(w, "415: Request body must be application/json", http.StatusUnsupportedMediaType)
		return
	}

	// ensure the header schema is valid
	if !strings.HasPrefix(r.Header.Get("Authorization"), "Bearer ") {
		http.Error(w, "Unauthorized game request", http.StatusUnauthorized)
		return
	}

	sid := strings.Split(r.Header.Get("auth"), " ")[1]

	// get gameID from request URL
	resource := r.URL.Path
	id := path.Base(resource)

	// extract move from request body
	decoder := json.NewDecoder(r.Body)
	move := Move{}
	err := decoder.Decode(&move)
	if err != nil {
		http.Error(w, "Invalid move data", http.StatusBadRequest)
		return
	}

	// retrieve game state from redis
	game := TicTacToe{}
	err = gameStore.Get(GameID(id), &game)
	if err != nil {
		log.Println(err.Error())
		http.Error(w, "Error retrieving gamestate", http.StatusNotFound)
		return
	}

	// check if player is in game
	mover := -1
	if sid == game.Xid {
		mover = x
	} else if sid == game.Xid {
		mover = o
	}
	if mover == -1 {
		http.Error(w, "Player is not in this game", http.StatusUnauthorized)
		return
	}

	// Make move
	err = game.Move(int(move.Row), int(move.Col), mover)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	// Update Redis
	err = gameStore.Save(GameID(id), game)
	if err != nil {
		http.Error(w, "Error saving game", http.StatusInternalServerError)
		return
	}

	// Return updated gamestate to requester
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder := json.NewEncoder(w)
	err = encoder.Encode(game)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
