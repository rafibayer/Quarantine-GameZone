package main

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"path"

	"log"
	"net/http"
)

// GameLobby struct from gateway:games.go
type GameLobby struct {
	ID       string   `json:"game_id"`
	GameType string   `json:"game_type"`
	Private  bool     `json:"private"`
	Players  []string `json:"players"`
	Capacity int      `json:"capacity"`
	GameID   string   `json:"gameID"`
}

// Move holds information to make a move on a given game
type Move struct {
	Sid      string `json:"sid"`
	MoveData struct {
		Row int `json:"row"`
		Col int `json:"col"`
	} `json:"movedata"`
}

const gameIDLength = 12

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

	gameID := make([]byte, gameIDLength)
	_, err = rand.Read(gameID)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	gamestate := NewTicTacToe(lobby.Players[0], lobby.Players[1])
	gameStore.Save(GameID(gameID), &gamestate)

	type Response struct {
		Gamestate *TicTacToe `json:"gamestate"`
		Gameid    string     `json:"gameid"`
	}

	resp := Response{gamestate, base64.URLEncoding.EncodeToString(gameID)}
	log.Printf("Creating game: %+v", resp)
	// create game and return as JSON with status 201

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	err = encoder.Encode(resp)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
	return

}

// SpecificGameHandler is used to play games of tic-tac-toe
func (gameStore *RedisStore) SpecificGameHandler(w http.ResponseWriter, r *http.Request) {
	// Method post
	if r.Method != http.MethodPost {
		http.Error(w, "Please provide method PATCH", http.StatusMethodNotAllowed)
	}
	// Content JSON
	if r.Header.Get("Content-Type") != "application/json" {
		http.Error(w, "415: Request body must be application/json", http.StatusUnsupportedMediaType)
		return
	}

	// get gameID from request URL
	resource := r.URL.Path
	id := path.Base(resource)
	if len(id) != gameIDLength {
		http.Error(w, "Game ID length should be exactly "+string(gameIDLength), http.StatusBadRequest)
		return
	}

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
	err = gameStore.Get(GameID(id), game)
	if err != nil {
		http.Error(w, "Error retrieving gamestate", http.StatusNotFound)
		return
	}

	// check if player is in game
	mover := -1
	if move.Sid == game.Xid {
		mover = x
	} else if move.Sid == game.Xid {
		mover = o
	}
	if mover == -1 {
		http.Error(w, "Player is not in this game", http.StatusUnauthorized)
		return
	}

	// Make move
	err = game.Move(int(move.MoveData.Row), int(move.MoveData.Col), mover)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	// Update Redis
	err = gameStore.Save(GameID(id), game)
	if err != nil {
		http.Error(w, "Error saving game", http.StatusInternalServerError)
	}

	// Return updated gamestate to requester
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	err = encoder.Encode(game)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
