package handlers

import (
	"bytes"
	"io"
	"net/http"
	"path"
	"strings"
	"time"

	"Quarantine-GameZone-441/servers/gateway/sessions"
)

// longest possible nickname
const NICKNAME_LIMIT = 20

func readerToString(reader io.ReadCloser) string {
	buf := new(bytes.Buffer)
	buf.ReadFrom(reader)
	return buf.String()
}

// SessionHandler handles requests for the "sessions" resource,
// and allows clients to begin a new session using a nickname.
func (ctx *HandlerContext) SessionHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method == http.MethodPost {

		if r.Header.Get("Content-Type") != "text/plain" {
			http.Error(w, "415: Request body must be text/plain", http.StatusUnsupportedMediaType)
			return
		}

		//parses the body for the nickname for the users session
		nickname := strings.TrimSpace(readerToString(r.Body))
		if len(nickname) == 0 || len(nickname) > NICKNAME_LIMIT {
			http.Error(w, "Invalid nickname", http.StatusForbidden)
			return
		}

		//begins a session
		SessionState := SessionState{
			time.Now(),
			nickname,
		}
		_, err := sessions.BeginSession(ctx.SigningKey, ctx.SessionStore, SessionState, w)
		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		//Responds back to the user with the updated user
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusCreated)

		w.Write([]byte(nickname))
		return
	}

	http.Error(w, "Please provide a POST method", http.StatusMethodNotAllowed)
}

//SpecificSessionHandler handles requests related to a specific authenticated session.
//Supports ending the current user's session.
func (ctx *HandlerContext) SpecificSessionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodDelete {

		//extracts the userID section of the URL which could either be a number or 'me'
		resource := r.URL.Path
		id := path.Base(resource)

		//checks if the user is allowed to delete this session
		if id != "mine" {
			http.Error(w, "This action is forbidden", http.StatusForbidden)
			return
		}

		//ends the session and deletes from database
		_, err := sessions.EndSession(
			r,
			ctx.SigningKey,
			ctx.SessionStore,
		)
		if err != nil {
			http.Error(w, "Couldn't terminate session", http.StatusBadRequest)
			return
		}

		//responds to user that sign out was successful
		w.Header().Set("Content-Type", "text/plain")
		w.Write([]byte("signed out"))
		return
	}

	http.Error(w, "Please provide a DELETE method", http.StatusMethodNotAllowed)
}
