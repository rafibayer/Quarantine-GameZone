package handlers

import (
	"Quarantine-GameZone-441/servers/gateway/sessions"
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var connections []*websocket.Conn

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// return r.Header.Get("Origin") == "https://website.com"
		return true
	},
}

//WsHandler fjdlskfj
func (ctx *HandlerContext) WsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to open websocket connection", 401)
		return
	}

	// auth check?

	connections = append(connections, conn)

	go (func(conn *websocket.Conn, ctx *HandlerContext) {
		defer conn.Close()

		for {
			messageType, p, _ := conn.ReadMessage()
			if messageType == websocket.TextMessage || messageType == websocket.BinaryMessage {
				ss := SessionState{}
				sessions.GetState(r, ctx.SigningKey, ctx.SessionStore, ss)

				fmt.Printf("test: %s: %s", ss.Nickname, string(p))

				for _, singleConn := range connections {
					singleConn.WriteMessage(websocket.TextMessage, p)
				}
			}
		}
	})(conn, ctx)
}
