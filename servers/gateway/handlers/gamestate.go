package handlers

import (
	"time"
)

type GameLobbyState struct {
	StartTime time.Time  `json:"startTime"`
	GameLobby *GameLobby `json: "game_lobby"`
	// GameLobby struct {
	// 	ID       GameSessionID `json:"game_id"`
	// 	GameType string        `json:"game_type"`
	// 	players  []SessionID   `json:"players"`
	// } `json: "game_lobby"`
}
