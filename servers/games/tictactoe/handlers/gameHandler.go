package handlers

import (
	"net/http"
)

// GameHandler is used to create new games of tic-tac-toe
func GameHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Please provide method POST", http.StatusMethodNotAllowed)
	}
	if r.Header.Get("Content-Type") != "application/json" {
		http.Error(w, "415: Request body must be application/json", http.StatusUnsupportedMediaType)
		return
	}

	// create game and return as JSON with status 201

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")

}

// SpecificGameHandler is used to play games of tic-tac-toe
func SpecificGameHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Please provide method PATCH", http.StatusMethodNotAllowed)
	}
	if r.Header.Get("Content-Type") != "application/json" {
		http.Error(w, "415: Request body must be application/json", http.StatusUnsupportedMediaType)
		return
	}

	// edit game and return it

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
}
