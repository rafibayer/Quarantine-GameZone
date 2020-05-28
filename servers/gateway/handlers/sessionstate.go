package handlers

import (
	"time"
)

type SessionState struct {
	StartTime time.Time `json:"startTime"`
	Nickname  string    `json:"nickname"`
}
