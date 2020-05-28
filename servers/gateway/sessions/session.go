package sessions

import (
	"errors"
	"log"
	"net/http"
	"strings"
)

const headerAuthorization = "Authorization"
const paramAuthorization = "auth"
const schemeBearer = "Bearer "

//ErrNoSessionID is used when no session ID was found in the Authorization header
var ErrNoSessionID = errors.New("no session ID found in " + headerAuthorization + " header")

//ErrInvalidScheme is used when the authorization scheme is not supported
var ErrInvalidScheme = errors.New("authorization scheme not supported")

//BeginSession creates a new SessionID, saves the `SessionState` to the store, adds an
//Authorization header to the response with the SessionID, and returns the new SessionID
func BeginSession(signingKey string, store Store, SessionState interface{}, w http.ResponseWriter) (SessionID, error) {

	// get a new sessionid with the passed singing key
	newSessionID, err := NewSessionID(signingKey)

	// if the sessionid could not be generated, return an error
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return InvalidSessionID, err
	}

	// save the new session and session state using the store implementation
	// and respond to the client with the sessionid in the header
	store.Save(newSessionID, SessionState)
	w.Header().Add(headerAuthorization, schemeBearer+newSessionID.String())

	return newSessionID, nil
}

//GetSessionID extracts and validates the SessionID from the request headers
func GetSessionID(r *http.Request, signingKey string) (SessionID, error) {

	// extract authorization header or query parameter
	auth := r.Header.Get(headerAuthorization)

	if len(auth) == 0 {
		auth = r.URL.Query().Get(paramAuthorization)
	}

	if len(auth) == 0 {
		return InvalidSessionID, ErrNoSessionID
	}

	// ensure the header schema is valid
	if !strings.HasPrefix(auth, schemeBearer) {
		return InvalidSessionID, ErrInvalidScheme
	}

	auth = strings.Split(auth, " ")[1]

	// ensure the sessionid signature is valid
	sessionID, err := ValidateID(auth, signingKey)
	if err != nil {
		return InvalidSessionID, err
	}

	return sessionID, nil
}

//GetState extracts the SessionID from the request,
//gets the associated state from the provided store into
//the `SessionState` parameter, and returns the SessionID
func GetState(r *http.Request, signingKey string, store Store, SessionState interface{}) (SessionID, error) {

	// get the sessionid from the request
	sessID, err := GetSessionID(r, signingKey)

	if err != nil {
		return InvalidSessionID, ErrNoSessionID
	}

	// retrieve the associated state from the store
	err = store.Get(sessID, SessionState)
	if err != nil {

		return InvalidSessionID, ErrStateNotFound
	}
	return sessID, nil
}

//EndSession extracts the SessionID from the request,
//and deletes the associated data in the provided store, returning
//the extracted SessionID.
func EndSession(r *http.Request, signingKey string, store Store) (SessionID, error) {

	// retrieve the sessionid from the request
	sessID, err := GetSessionID(r, signingKey)

	if err != nil {
		log.Printf("Couldn't get session: %s\n", err.Error())
		return InvalidSessionID, ErrNoSessionID
	}

	// delete the associate session from the store
	err = store.Delete(sessID)
	if err != nil {
		log.Printf("Couldn't delete session: %s\n", err.Error())
		return InvalidSessionID, ErrStateNotFound
	}
	return sessID, nil

}
