package handlers

import (
	"Quarantine-GameZone-441/servers/gateway/gamesessions"
	"Quarantine-GameZone-441/servers/gateway/sessions"

	"github.com/streadway/amqp"
)

// HandlerContext is a struct containing globals for a handler
type HandlerContext struct {
	SigningKey       string
	SessionStore     sessions.Store
	GameSessionStore gamesessions.Store
	Notifier         *Notifier
	Channel          *amqp.Channel
}

// NewHandlerContext creates a new HandlerContext
func NewHandlerContext(SigningKey string, SessionStore sessions.Store, GameSessionStore gamesessions.Store, ch *amqp.Channel) *HandlerContext {
	return &(HandlerContext{SigningKey, SessionStore, GameSessionStore, &Notifier{}, ch})
}
