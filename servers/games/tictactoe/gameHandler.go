package main

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"log"

	"net/http"
)

// GameLobby struct from gateway:games.go
type GameLobby struct {
	ID       string   `json:"lobby_id"`
	GameType string   `json:"game_type"`
	Private  bool     `json:"private"`
	Players  []string `json:"players"`
	Capacity int      `json:"capacity"`
	GameID   string   `json:"gameID"`
}

// Move holds information to make a move on a given game
type Move struct {
	Row int `json:"row"`
	Col int `json:"col"`
}

const gameIDLength = 16

// GameHandler is used to create new games of tic-tac-toe
func (gameStore *RedisStore) GameHandler(w http.ResponseWriter, r *http.Request) {
	// Method POST
	if r.Method != http.MethodPost {
		http.Error(w, "Please provide method POST", http.StatusMethodNotAllowed)
	}
	// content JSON
	if r.Header.Get("Content-Type") != "application/json" {
		http.Error(w, "415: Request body must be application/json", http.StatusUnsupportedMediaType)
		return
	}

	// Retrieve GameLobby from request
	lobby := GameLobby{}
	err := json.NewDecoder(r.Body).Decode(&lobby)
	if err != nil {
		http.Error(w, "Invalid game lobby", http.StatusBadRequest)
		return
	}

	// check the gamelobby is valid for this game
	if lobby.GameType != "tictactoe" || lobby.Capacity != 2 || len(lobby.Players) != 2 {
		http.Error(w, "Lobby settings are invalid for tictactoe", http.StatusBadRequest)
		return
	}

	randBytes := make([]byte, gameIDLength)
	_, err = rand.Read(randBytes)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	gameID := base64.URLEncoding.EncodeToString(randBytes)

	gamestate := NewTicTacToe(lobby.Players[0], lobby.Players[1])
	log.Printf("made game: %+v", gamestate)

	gameStore.Save(GameID(gameID), gamestate)

	type Response struct {
		Gamestate *TicTacToe `json:"gamestate"`
		Gameid    string     `json:"gameid"`
	}

	resp := Response{gamestate, gameID}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	err = encoder.Encode(resp)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
	return

}

// SpecificGameHandler is used to GET the state of and POST moves to a specific game
// of tic tac toe
func (gameStore *RedisStore) SpecificGameHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		gameStore.SpecificGameHandlerPost(w, r)
		return
	case http.MethodGet:
		gameStore.SpecificGameHandlerGet(w, r)
		return
	}

	http.Error(w, "Please provide method POST or GET", http.StatusMethodNotAllowed)
}
