package gamesessions

import (
	"errors"
	"log"
	"net/http"
	"path"
)

// const headerAuthorization = "Authorization"
// const paramAuthorization = "auth"
// const schemeBearer = "Bearer "

//ErrNoSessionID is used when no session ID was found in the Authorization header
var ErrNoSessionID = errors.New("no gameSessionID found in url ")

//BeginGameSession creates a new SessionID, saves the `SessionState` to the store, adds an
//Authorization header to the response with the SessionID, and returns the new SessionID
func BeginGameSession(signingKey string, store Store, GameLobbyState interface{}, w http.ResponseWriter) (GameSessionID, error) {

	// get a new sessionid with the passed singing key
	newGameSessionID, err := NewSessionID(signingKey)

	// if the sessionid could not be generated, return an error
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return InvalidGameSessionID, err
	}

	// save the new session and session state using the store implementation
	// and respond to the client with the sessionid in the header
	store.Save(newGameSessionID, GameLobbyState)
	return newGameSessionID, nil
}

//UpdateGameSession updates a currenty existing gameSessionID with a new player
func UpdateGameSession(signingkey string, store Store, GameLobbyState interface{}, w http.ResponseWriter, gameSessionID GameSessionID) (GameSessionID, error) {
	store.Save(gameSessionID, GameLobbyState)
	return gameSessionID, nil
}

//GetGameSessionID extracts and validates the SessionID from the request headers
func GetGameSessionID(r *http.Request, signingKey string) (GameSessionID, error) {

	// extract gamesession id from url
	resource := r.URL.Path
	gameID := path.Base(resource)

	// ensure the sessionid signature is valid
	gameSessionID, err := ValidateID(gameID, signingKey)
	if err != nil {
		return InvalidGameSessionID, err
	}

	return gameSessionID, nil
}

//GetGameState extracts the SessionID from the request,
//gets the associated state from the provided store into
//the `SessionState` parameter, and returns the SessionID
func GetGameState(r *http.Request, signingKey string, store Store, SessionState interface{}) (GameSessionID, error) {

	// get the sessionid from the request
	gameSessID, err := GetGameSessionID(r, signingKey)

	if err != nil {
		return InvalidGameSessionID, ErrNoSessionID
	}

	// retrieve the associated state from the store
	err = store.Get(gameSessID, SessionState)
	if err != nil {

		return InvalidGameSessionID, ErrStateNotFound
	}
	return gameSessID, nil
}

//EndGameSession extracts the SessionID from the request,
//and deletes the associated data in the provided store, returning
//the extracted SessionID.
func EndGameSession(r *http.Request, signingKey string, store Store) (GameSessionID, error) {

	// retrieve the sessionid from the request
	sessID, err := GetGameSessionID(r, signingKey)

	if err != nil {
		log.Printf("Couldn't get session: %s\n", err.Error())
		return InvalidGameSessionID, ErrNoSessionID
	}

	// delete the associate session from the store
	err = store.Delete(sessID)
	if err != nil {
		log.Printf("Couldn't delete session: %s\n", err.Error())
		return InvalidGameSessionID, ErrStateNotFound
	}
	return sessID, nil

}
