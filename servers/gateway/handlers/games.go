package handlers

import (
	"Quarantine-GameZone-441/servers/gateway/gamesessions"
	"Quarantine-GameZone-441/servers/gateway/sessions"
	"encoding/json"

	"net/http"
	"time"
)

//NewGameLobby struct represents the state of a game lobby, this is created for every game
type NewGameLobby struct {
	// ID       gamesessions.GameSessionID `json:"game_id"`
	GameType string               `json:"game_type"`
	Private  bool                 `json:"private"`
	Players  []sessions.SessionID `json:"players"`
}

//GameLobby struct represents the state of a game lobby, this is created for every game
type GameLobby struct {
	// ID       gamesessions.GameSessionID `json:"game_id"`
	GameType string               `json:"game_type"`
	Private  bool                 `json:"private"`
	Players  []sessions.SessionID `json:"players"`
	Capacity int64                `json:"capacity"`
}

//GameHandler handles request for making a gametype
func (ctx *HandlerContext) GameHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method == http.MethodPost {

		if r.Header.Get("Content-Type") != "application/json" {
			http.Error(w, "415: Request body must be application/json", http.StatusUnsupportedMediaType)
			return
		}

		// decode request body into NewUser
		decoder := json.NewDecoder(r.Body)
		var newGameLobby NewGameLobby
		gameLobbyPointer := &newGameLobby
		err := decoder.Decode(gameLobbyPointer)
		if err != nil {
			http.Error(w, "Please provide a valid game lobby", http.StatusBadRequest)
			return
		}

		//create official game lobby, this will be changed to be check infront of an intnal
		// json map, I hardcoded for now
		gameLobby := &GameLobby{}
		if newGameLobby.GameType == "tictactoe" {
			gameLobby.GameType = newGameLobby.GameType
			gameLobby.Private = newGameLobby.Private
			gameLobby.Players = newGameLobby.Players
			gameLobby.Capacity = 2
		} else {
			http.Error(w, "we only support tictactoe right now", http.StatusBadRequest)
			return
		}

		//begins a session
		GameLobbyState := GameLobbyState{
			time.Now(),
			gameLobby,
		}
		_, err = gamesessions.BeginGameSession(ctx.SigningKey, ctx.GameSessionStore, GameLobbyState, w)
		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		//Responds back to the user with the updated user
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		encoder := json.NewEncoder(w)
		err = encoder.Encode(gameLobby)
		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		return
	}

	http.Error(w, "405: Method not allowed", http.StatusMethodNotAllowed)
	return
}

func (ctx *HandlerContext) SpecificGameHandler(w http.ResponseWriter, r *http.Request) {

}
