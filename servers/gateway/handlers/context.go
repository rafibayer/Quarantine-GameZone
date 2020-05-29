package handlers

import (
	"Quarantine-GameZone-441/servers/gateway/gamesessions"
	"Quarantine-GameZone-441/servers/gateway/sessions"
)

// HandlerContext is a struct containing globals for a handler
type HandlerContext struct {
	SigningKey   string
	SessionStore sessions.Store
}

type GameHandlerContext struct {
	SigningKey   string
	SessionStore gamesessions.Store
}

// NewHandlerContext creates a new HandlerContext
func NewHandlerContext(SigningKey string, SessionStore sessions.Store) *HandlerContext {
	return &(HandlerContext{SigningKey, SessionStore})
}

// NewGameHandlerContext creates a new HandlerContext
func NewGameHandlerContext(SigningKey string, SessionStore gamesessions.Store) *GameHandlerContext {
	return &(GameHandlerContext{SigningKey, SessionStore})
}
