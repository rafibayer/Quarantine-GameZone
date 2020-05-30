package handlers

import (
	"Quarantine-GameZone-441/servers/gateway/gamesessions"
	"Quarantine-GameZone-441/servers/gateway/sessions"
	"encoding/json"
	"path"

	"net/http"
	"time"
)

//NewGameLobby struct represents the state of a game lobby, this is created for every game
type NewGameLobby struct {
	GameType string               `json:"game_type"`
	Private  bool                 `json:"private"`
	Players  []sessions.SessionID `json:"players"`
}

//GameLobby struct represents the state of a game lobby, this is created for every game
type GameLobby struct {
	ID       gamesessions.GameSessionID `json:"game_id"`
	GameType string                     `json:"game_type"`
	Private  bool                       `json:"is_private"`
	Players  []sessions.SessionID       `json:"players"`
	Capacity int                        `json:"capacity"`
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

		//TODO: append to session the new player
		SessionState := SessionState{}
		newPlayerSessionID, err := sessions.GetState(
			r,
			ctx.SigningKey,
			ctx.SessionStore,
			&SessionState,
		)
		if err != nil {
			http.Error(w, "Please create a nickname to start your playing experience", http.StatusUnauthorized)
			return
		}
		playersSlice := gameLobby.Players[:len(gameLobby.Players)]
		playersSlice = append(playersSlice, newPlayerSessionID)

		gameLobby.Players = playersSlice

		//begins a session
		GameLobbyState := GameLobbyState{
			time.Now(),
			gameLobby,
		}
		newGameSessionID, err := gamesessions.BeginGameSession(ctx.SigningKey, ctx.GameSessionStore, GameLobbyState, w)
		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		//TODO: this creates a bug because the new gamesessionID is never stored in redis properly
		GameLobbyState.GameLobby.ID = newGameSessionID
		_, err = gamesessions.UpdateGameSession(ctx.SigningKey, ctx.GameSessionStore, GameLobbyState, w, newGameSessionID)
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
}

//SpecificGameHandler handles request for a specific game session, currently we are supporting
// a post request that adds a new player to the game session, this is currently done by sending the sessID
// in the request body (maybe needs to change to getting the sessionID from autherization header)
func (ctx *HandlerContext) SpecificGameHandler(w http.ResponseWriter, r *http.Request) {

	GameSessionState := GameLobbyState{}
	_, err := gamesessions.GetGameState(
		r,
		ctx.SigningKey,
		ctx.GameSessionStore,
		&GameSessionState,
	)
	if err != nil {
		http.Error(w, "game session doesn't exist", http.StatusUnauthorized)
		return
	}

	gameLobby := GameSessionState.GameLobby

	//this is meant to add a new player to the gamesession
	if r.Method == http.MethodPost {
		resource := r.URL.Path
		gameID := path.Base(resource)
		gameIDType := gamesessions.GameSessionID(gameID)

		//extracts the new session ID from the request body, we will either do this or get it from the auth
		// var newPlayerSessionID sessions.SessionID
		// decoder := json.NewDecoder(r.Body)
		// err := decoder.Decode(&newPlayerSessionID)

		// if err != nil {
		// 	http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		// 	return
		// }

		//TODO: potentially extract the userID from the autherization header
		//creates an empty sessionstate and fills it up based of if the user exists
		SessionState := SessionState{}
		newPlayerSessionID, err := sessions.GetState(
			r,
			ctx.SigningKey,
			ctx.SessionStore,
			&SessionState,
		)
		if err != nil {
			http.Error(w, "Please create a nickname to start your playing experience", http.StatusUnauthorized)
			return
		}

		//check if the new player is already in the game
		id := gameLobby.Players
		for _, player := range id {
			if player == newPlayerSessionID {
				http.Error(w, "Player is already in the game", http.StatusBadRequest)
				return
			}
		}

		//check if the capacity is already at max
		if gameLobby.Capacity == len(gameLobby.Players) {
			http.Error(w, "game is already at full capacity of players", http.StatusForbidden)
			return
		}

		playersSlice := gameLobby.Players[:]
		playersSlice = append(playersSlice, newPlayerSessionID)

		gameLobby.Players = playersSlice
		_, err = gamesessions.UpdateGameSession(ctx.SigningKey, ctx.GameSessionStore, GameSessionState, w, gameIDType)
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
		//this method will allow spectators potentially? only if you made a nickname and have a sessionID
	} else if r.Method == http.MethodGet {
		SessionState := SessionState{}
		_, err := sessions.GetState(
			r,
			ctx.SigningKey,
			ctx.SessionStore,
			&SessionState,
		)
		if err != nil {
			http.Error(w, "Please create a nickname to start your playing experience", http.StatusUnauthorized)
			return
		}

		GameSessionState := GameLobbyState{}
		_, err = gamesessions.GetGameState(
			r,
			ctx.SigningKey,
			ctx.GameSessionStore,
			&GameSessionState,
		)
		if err != nil {
			http.Error(w, "game session doesn't exist", http.StatusUnauthorized)
			return
		}

		//TODO: check if private, only allow current players to view game then

		gameLobby := GameSessionState.GameLobby
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		encoder := json.NewEncoder(w)
		err = encoder.Encode(gameLobby)
		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		return

	}
	http.Error(w, "405: Method not allowed", http.StatusMethodNotAllowed)
}
