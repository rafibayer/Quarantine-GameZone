package handlers

import (
	"Quarantine-GameZone-441/servers/gateway/gamesessions"
	"Quarantine-GameZone-441/servers/gateway/sessions"
	"errors"
	"io/ioutil"
	"log"
	"net/http"
)

const unauthEndPoint string = "UNAUTHORIZED"

func (ctx *HandlerContext) gameAndPlayerAuthentication(r *http.Request) (string, error) {
	SessionState := SessionState{}
	sessID, err := sessions.GetState(r, ctx.SigningKey, ctx.SessionStore, &SessionState)
	if err != nil {
		return unauthEndPoint, errors.New("Please create a nickname to start your playing experience")
	}

	LobbySessionState := GameLobbyState{}
	_, err = gamesessions.GetGameState(r, ctx.SigningKey, ctx.GameSessionStore, &LobbySessionState)
	if err != nil {
		return unauthEndPoint, errors.New("lobby session doesn't exist")
	}

	//check if game has begun using gameID as flag
	gameID := LobbySessionState.GameLobby.GameID
	if len(gameID) == 0 {
		return unauthEndPoint, errors.New("game session doesn't exist")
	}
	log.Printf("gameID from game lobby %s", gameID)

	playerExists := false
	for _, player := range LobbySessionState.GameLobby.Players {
		if sessID == player {
			playerExists = true
		}
	}

	if !playerExists {
		return unauthEndPoint, errors.New("You aren't a player in this game")
	}

	return (Endpoints[LobbySessionState.GameLobby.GameType] + "/" + gameID), nil
}

//SpecificGameHandlerPost handles request to a specific game, this directs the request toward the game
// and sends the response from the game back to the client while checking for game existence and player authentication
func (ctx *HandlerContext) SpecificGameHandlerPost(w http.ResponseWriter, r *http.Request) {
	//check if player is in the game using the auth

	reqEndPoint, err := ctx.gameAndPlayerAuthentication(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	resp, err := http.Post(reqEndPoint, r.Header.Get("Content-Type"), r.Body)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	for k, v := range r.Header {
		w.Header().Set(k, v[0])
	}
	w.WriteHeader(resp.StatusCode)
	w.Write(body)
}

//SpecificGameHandlerGet handles requests to get a gamestate from a specific game,
// and directs response back to the client
func (ctx *HandlerContext) SpecificGameHandlerGet(w http.ResponseWriter, r *http.Request) {

	// SessionState := SessionState{}
	// sessID, err := sessions.GetState(r, ctx.SigningKey, ctx.SessionStore, &SessionState)
	// if err != nil {
	// 	http.Error(w, "Please create a nickname to start your playing experience", http.StatusUnauthorized)
	// 	return
	// }
	reqEndPoint, err := ctx.gameAndPlayerAuthentication(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	resp, err := http.Get(reqEndPoint)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	for k, v := range r.Header {
		w.Header().Set(k, v[0])
	}
	w.WriteHeader(resp.StatusCode)
	w.Write(body)
}
