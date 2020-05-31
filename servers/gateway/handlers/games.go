package handlers

import (
	"Quarantine-GameZone-441/servers/gateway/gamesessions"
	"Quarantine-GameZone-441/servers/gateway/sessions"
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"path"

	"net/http"
	"time"
)

//TODO: Make sure we never send back user tokens or any other sensitive info
//	change it all to plain text repsonses later

//GameLobby struct represents the state of a game lobby, this is created for every game
type GameLobby struct {
	ID       gamesessions.GameSessionID `json:"game_id"`
	GameType string                     `json:"game_type"`
	Private  bool                       `json:"private"`
	Players  []sessions.SessionID       `json:"players"`
	Capacity int                        `json:"capacity"`
	GameID   string                     `json:"gameID"`
}

//NewGameLobby struct represents the state of a game lobby, this is created for every game
type NewGameLobby struct {
	GameType string `json:"game_type"`
	Private  bool   `json:"private"`
}

//ResponseGameLobby struct represents the state of the lobby that is sent to the client, with no session IDs
// instead the usern nicknames are stored
type ResponseGameLobby struct {
	ID       gamesessions.GameSessionID `json:"lobby_id"`
	GameType string                     `json:"game_type"`
	Private  bool                       `json:"private"`
	Players  []string                   `json:"players"`
	Capacity int                        `json:"capacity"`
	GameID   string                     `json:"gameID"`
}

func (ctx *HandlerContext) convertToResponseLobbyForClient(gameLobby GameLobby) (*ResponseGameLobby, error) {
	nicknames := make([]string, 0)
	gameLobbyResponse := &ResponseGameLobby{}
	for _, player := range gameLobby.Players {
		playerSessionState := &SessionState{}
		err := ctx.SessionStore.Get(player, playerSessionState)
		if err != nil {
			return nil, err
		}
		nicknames = append(nicknames, playerSessionState.Nickname)
	}
	gameLobbyResponse.ID = gameLobby.ID
	gameLobbyResponse.GameType = gameLobby.GameType
	gameLobbyResponse.Private = gameLobby.Private
	gameLobbyResponse.Capacity = gameLobby.Capacity
	gameLobbyResponse.GameID = gameLobby.GameID
	gameLobbyResponse.Players = nicknames
	return gameLobbyResponse, nil
}

//LobbyHandler handles request for making a gametype
func (ctx *HandlerContext) LobbyHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method == http.MethodPost {
		if r.Header.Get("Content-Type") != "application/json" {
			http.Error(w, "415: Request body must be application/json", http.StatusUnsupportedMediaType)
			return
		}

		// decode request body into a new gamelobby
		decoder := json.NewDecoder(r.Body)
		var newGameLobby NewGameLobby
		gameLobbyPointer := &newGameLobby
		err := decoder.Decode(gameLobbyPointer)
		if err != nil {
			http.Error(w, "Please provide a valid game lobby", http.StatusBadRequest)
			return
		}

		//TODO: append to session the new player
		SessionState := SessionState{}
		playerSessID, err := sessions.GetState(
			r,
			ctx.SigningKey,
			ctx.SessionStore,
			&SessionState,
		)
		if err != nil {
			http.Error(w, "Please create a nickname to start your playing experience", http.StatusUnauthorized)
			return
		}
		playersSlice := make([]sessions.SessionID, 0)
		playersSlice = append(playersSlice, playerSessID)

		//create official game lobby
		gameLobby := &GameLobby{}
		if gameCapacity, OK := GameCapacity[newGameLobby.GameType]; OK {
			gameLobby.GameType = newGameLobby.GameType
			gameLobby.Private = newGameLobby.Private
			gameLobby.Capacity = gameCapacity
			gameLobby.Players = playersSlice
		} else {
			http.Error(w, fmt.Sprintf("we currently dont support the game: %s", newGameLobby.GameType), http.StatusBadRequest)
			return
		}
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

		ResponseGameLobby, err := ctx.convertToResponseLobbyForClient(*GameLobbyState.GameLobby)
		if err != nil {
			http.Error(w, "Please make sure all game players have a nickname", http.StatusUnauthorized)
			return
		}

		//Responds back to the user with the updated user
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		encoder := json.NewEncoder(w)
		err = encoder.Encode(ResponseGameLobby)
		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		return
	}
	// }
	//  }
	//else if r.Method == http.MethodGet {
	// 	SessionState := SessionState{}
	// 	_, err := sessions.GetState(
	// 		r,
	// 		ctx.SigningKey,
	// 		ctx.SessionStore,
	// 		&SessionState,
	// 	)

	// 	if err != nil {
	// 		http.Error(w, "Please create a nickname to start your playing experience", http.StatusUnauthorized)
	// 		return
	// 	}

	// 	//get all games in redis
	// }

	http.Error(w, "405: Method not allowed", http.StatusMethodNotAllowed)
}

//SpecificLobbyHandler handles request for a specific game session, currently we are supporting
// a post request that adds a new player to the game session, this is currently done by sending the sessID
// in the request body (maybe needs to change to getting the sessionID from autherization header)
func (ctx *HandlerContext) SpecificLobbyHandler(w http.ResponseWriter, r *http.Request) {

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
			log.Println(err)

			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		if len(gameLobby.Players) == gameLobby.Capacity {
			//games.go -> gameHandler: body: [player auths]
			// <- gamestate json + gameid (thats in redis)
			// you store gameid in lobby
			// <- client
			requestBody, err := json.Marshal(gameLobby)
			if err != nil {
				log.Println(err)

				http.Error(w, "Internal server error", http.StatusInternalServerError)
				return
			}

			resp, err := http.Post(Endpoints[gameLobby.GameType], "application/json", bytes.NewBuffer(requestBody))
			if err != nil {
				log.Println(err)

				http.Error(w, "Internal server error", http.StatusInternalServerError)
				return
			}

			respBytes, err := ioutil.ReadAll(resp.Body)
			if err != nil {
				log.Println(err)
				http.Error(w, "Internal server error", http.StatusInternalServerError)
				return
			}
			log.Printf("respbytes: %s", respBytes)

			//var result map[string]interface{}
			var result map[string]interface{}

			json.Unmarshal(respBytes, &result)

			actualGameState := result["gamestate"]
			gameID := result["gameid"]

			strGameID := fmt.Sprintf("%v", gameID)

			gameLobby.GameID = strGameID
			_, err = gamesessions.UpdateGameSession(ctx.SigningKey, ctx.GameSessionStore, GameSessionState, w, gameIDType)
			if err != nil {
				log.Println(err)
				http.Error(w, "Internal server error", http.StatusInternalServerError)
				return
			}

			type Response struct {
				GameID    string      `json:"game_id"`
				Gamestate interface{} `json:"game_state"`
			}

			response := Response{strGameID, actualGameState}
			//Responds back to the user with the updated user
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			encoder := json.NewEncoder(w)
			err = encoder.Encode(response)
			if err != nil {
				log.Println(err)

				http.Error(w, "Internal server error", http.StatusInternalServerError)
				return
			}
			return
		}
		ResponseGameLobby, err := ctx.convertToResponseLobbyForClient(*gameLobby)
		if err != nil {
			http.Error(w, "Please make sure all game players have a nickname", http.StatusUnauthorized)
			return
		}

		//Responds back to the user with the updated user
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		encoder := json.NewEncoder(w)
		err = encoder.Encode(ResponseGameLobby)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		return
		//this method will allow spectators potentially? only if you made a nickname and have a sessionID
	} else if r.Method == http.MethodGet {
		SessionState := SessionState{}
		playerSessionID, err := sessions.GetState(
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
		gameLobby = GameSessionState.GameLobby

		//check if game is private, if it is then only response with struct if player is a current game player
		if GameSessionState.GameLobby.Private {
			for _, player := range GameSessionState.GameLobby.Players {
				if player == playerSessionID {
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusOK)
					encoder := json.NewEncoder(w)
					err = encoder.Encode(gameLobby)
					if err != nil {
						log.Println(err)
						http.Error(w, "Internal server error", http.StatusInternalServerError)
						return
					}
				}
			}
			http.Error(w, "This game is private, you must be a current player to view it", http.StatusUnauthorized)
			return
		}

		ResponseGameLobby, err := ctx.convertToResponseLobbyForClient(*gameLobby)
		if err != nil {
			http.Error(w, "Please make sure all game players have a nickname", http.StatusUnauthorized)
			return
		}

		//gameLobby := GameSessionState.GameLobby
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		encoder := json.NewEncoder(w)
		err = encoder.Encode(ResponseGameLobby)
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		// } else if r.Method = http.MethodPatch {

		// 	SessionState := SessionState{}
		// 	_, err := sessions.GetState(
		// 		r,
		// 		ctx.SigningKey,
		// 		ctx.SessionStore,
		// 		&SessionState,
		// 	)
		// 	if err != nil {
		// 		http.Error(w, "Please create a nickname to start your playing experience", http.StatusUnauthorized)
		// 		return
		// 	}

		// 	LobbySessionState := GameLobbyState{}
		// 	_, err = gamesessions.GetGameState(
		// 		r,
		// 		ctx.SigningKey,
		// 		ctx.GameSessionStore,
		// 		&GameSessionState,
		// 	)
		// 	if err != nil {
		// 		http.Error(w, "lobby session doesn't exist", http.StatusUnauthorized)
		// 		return
		// 	}

		// 	gameID := LobbySessionState.GameID
		// 	if len(gameID) == 0 || gameID == nil {
		// 		http.Error(w, "game session doesn't exist", http.StatusUnauthorized)
		// 		return
		// 	}

		// 	playerExists := false
		// 	for _, player := range LobbySessionState.GameLobby.Players {
		// 		if SessionState.Nickname == player {
		// 			playerExists = true
		// 		}
		// 	}

		// 	if (playerExists) {
		// 		reqEndPoint = Endpoints[LobbySessionState.gameLobby.GameType] + gameID
		// 		resp, err := http.Patch(Endpoints[LobbySessionState.gameLobby.GameType] + ga, r.Header.Get("Content-Type"), bytes.NewBuffer(r.Body))
		// 	}

	}
	http.Error(w, "405: Method not allowed", http.StatusMethodNotAllowed)
}

// client -> header: auth, body: gametype...
// redis<- new lobby
// player joins
//
// games.go -> gameHandler: body: [player auths]
// <- gamestate json + gameid (thats in redis)
// you store gameid in lobby
// <- client

// client: lobbyid, gamestate (v1/games/lobbyid)
// games.go: lobbyid(gameid)
// tictactoe: gameid

// client -> body: move, header: auth, url: gameid
// send to microservice: body: (move, nickname), url: v1/gametype/gameID
// redis[lobbyid]: lobby metadata gameid

// /v1/gamelobby/lobbyid
// post
// all lobby changes (addingplayer)	-> creates a game (lets client know) ->
// -> client now knows to send get specific game /v1/game/lobbyid(Get) (start loop)
// get
// gets the specific lobby state
// patch
// removes players -> if 0 players, lobby deletes

// /v1/game/lobbyid
// post
//all gamestate changes (making a move)
// get
//gets the specific game state

// /v1/gamelobby
// post
// makes a lobby
// get
// gets all public games (lobby states)
