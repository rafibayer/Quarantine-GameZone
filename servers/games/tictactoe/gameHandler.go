package main

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"

	"net/http"
)

// GameLobby struct from gateway:games.go
type GameLobby struct {
	ID       string   `json:"lobby_id"`
	GameType string   `json:"game_type"`
	Players  []string `json:"players"`
	Capacity int      `json:"capacity"`
	GameID   string   `json:"gameID"`
}

// Move holds information to make a move on a given game
type Move struct {
	Row int `json:"row"`
	Col int `json:"col"`
}

// TicTacToeResponse struct holds gamestate for client use,
// uses nicknames instead of sensitive session ID's
type TicTacToeResponse struct {
	Board   [3][3]int `json:"Board"`
	Xturn   bool      `json:"xturn"`
	Xname   string    `json:"xname"`
	Oname   string    `json:"oname"`
	Outcome string    `json:"outcome"`
}

const gameIDLength = 16

// InvalidNickname is a placeholder if a sessions nickname cannot be found
const InvalidNickname = "INVALID"

func PrepareGameStateResponse(game *TicTacToe) (*TicTacToeResponse, error) {
	client := &http.Client{}

	xname, err := GetNickname(game.Xid, client)
	if err != nil {
		return nil, err
	}
	oname, err := GetNickname(game.Oid, client)
	if err != nil {
		return nil, err
	}

	result := &TicTacToeResponse{
		Board:   game.Board,
		Xturn:   game.Xturn,
		Xname:   xname,
		Oname:   oname,
		Outcome: game.Outcome,
	}

	log.Printf("Made game response: %+v", result)
	return result, nil
}

// GetNickname retrieves a nickname for a given sessionID and client connection
func GetNickname(sid string, client *http.Client) (string, error) {
	req, err := http.NewRequest("GET", Endpoints["nicknames"], nil)
	if err != nil {
		return InvalidNickname, err
	}
	req.Header.Set("Authorization", "Bearer "+sid)
	nameResp, err := client.Do(req)
	if err != nil {
		return InvalidNickname, err
	}
	if nameResp.StatusCode >= 400 {
		return InvalidNickname, fmt.Errorf("Recieved status %s from server", string(nameResp.StatusCode))
	}

	name, err := ioutil.ReadAll(nameResp.Body)
	if err != nil {
		return InvalidNickname, err
	}

	return string(name), nil

}

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
	if gamestate == nil {
		log.Println("Failed to get nicknames")
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
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
