package handlers

import (
	"Quarantine-GameZone-441/servers/gateway/gamesessions"
	"Quarantine-GameZone-441/servers/gateway/sessions"
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"path"
)

// Given a gamelobby, activate the game and return the gamestate struct
func activateGame(lobby *GameLobby, sessID sessions.SessionID) (map[string]interface{}, error) {
	requestBody, err := json.Marshal(&lobby)
	if err != nil {
		return nil, err
	}

	log.Println("lobby from activate game", &lobby)
	log.Println("requestbody", requestBody)

	// request, err := http.NewRequest("POST", Endpoints[lobby.GameType], bytes.NewBuffer(requestBody))
	// if err != nil {
	// 	return nil, err
	// }

	// request.Header.Set("Authorization", "bearer"+sessID.String())

	resp, err := http.Post(Endpoints[lobby.GameType], "application/json", bytes.NewBuffer(requestBody))
	if err != nil {
		log.Println(err)
		log.Println(Endpoints[lobby.GameType])
		log.Println(lobby.GameType)
		return nil, err
	}

	respBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	json.Unmarshal(respBytes, &result)
	return result, nil
}

// SpecificLobbyHandlerPost is used to add players to lobbies
// if the joining player fills the lobby, the game will be activated
// and the GameID will be sent back with the lobby indicating to the
// client the game has started
func (ctx *HandlerContext) SpecificLobbyHandlerPost(w http.ResponseWriter, r *http.Request) {
	gameLobbyState := GameLobbyState{}
	_, err := gamesessions.GetGameState(r, ctx.SigningKey, ctx.GameSessionStore, &gameLobbyState)
	if err != nil {
		http.Error(w, "game session doesn't exist", http.StatusUnauthorized)
		return
	}

	gameLobby := gameLobbyState.GameLobby
	gameIDType := gamesessions.GameSessionID(path.Base(r.URL.Path))

	//TODO: potentially extract the userID from the autherization header
	//creates an empty sessionstate and fills it up based of if the user exists
	SessionState := SessionState{}
	newPlayerSessionID, err := sessions.GetState(r, ctx.SigningKey, ctx.SessionStore, &SessionState)
	if err != nil {
		http.Error(w, "Please create a nickname to start your playing experience", http.StatusUnauthorized)
		return
	}

	//check if the new player is already in the game
	for _, player := range gameLobby.Players {
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

	// add creator to game
	playersSlice := gameLobby.Players[:]
	playersSlice = append(playersSlice, newPlayerSessionID)

	gameLobby.Players = playersSlice
	_, err = gamesessions.UpdateGameSession(ctx.SigningKey, ctx.GameSessionStore, gameLobbyState, w, gameIDType)
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
		result, err := activateGame(gameLobby, gameLobby.Players[0])
		if err != nil {
			log.Println(err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		gameLobby.GameID = fmt.Sprintf("%v", result["gameid"])
		_, err = gamesessions.UpdateGameSession(ctx.SigningKey, ctx.GameSessionStore, gameLobbyState, w, gameIDType)
		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
	}
	ResponseGameLobby, err := ctx.convertToResponseLobbyForClient(*gameLobby)
	if err != nil {
		http.Error(w, "Please make sure all game players have a nickname", http.StatusUnauthorized)
		return
	}

	//Responds back to the user with the updated user
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	log.Printf("Returning lobby to client: %+v", *gameLobby)
	encoder := json.NewEncoder(w)
	err = encoder.Encode(ResponseGameLobby)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

}

func (ctx *HandlerContext) SpecificLobbyHandlerGet(w http.ResponseWriter, r *http.Request) {
	SessionState := SessionState{}
	playerSessionID, err := sessions.GetState(r, ctx.SigningKey, ctx.SessionStore, &SessionState)
	if err != nil {
		http.Error(w, "Please create a nickname to start your playing experience", http.StatusUnauthorized)
		return
	}

	GameSessionState := GameLobbyState{}
	_, err = gamesessions.GetGameState(r, ctx.SigningKey, ctx.GameSessionStore, &GameSessionState)
	if err != nil {
		http.Error(w, "game session doesn't exist", http.StatusUnauthorized)
		return
	}
	gameLobby := GameSessionState.GameLobby

	// only respond with struct if player is a current game player
	isMember := false
	for _, player := range GameSessionState.GameLobby.Players {
		if player == playerSessionID {
			isMember = true
		}
	}

	if !isMember {
		http.Error(w, "you must be a current player to this game", http.StatusUnauthorized)
		return
	}

	ResponseGameLobby, err := ctx.convertToResponseLobbyForClient(*gameLobby)
	if err != nil {
		http.Error(w, "Please make sure all game players have a nickname", http.StatusUnauthorized)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder := json.NewEncoder(w)
	err = encoder.Encode(ResponseGameLobby)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}
