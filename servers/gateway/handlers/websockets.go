package handlers

import (
	"Quarantine-GameZone-441/servers/gateway/sessions"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/streadway/amqp"
)

//Notifier asdff
type Notifier struct {
	Connections map[string]*websocket.Conn
	lock        sync.Mutex
}

//User ajsdlfkj
type User struct {
	Nickname  string
	SessionID string
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// return r.Header.Get("Origin") == "https://website.me"
		return true
	},
}

//InsertConnection inserts ws connection
func (n *Notifier) InsertConnection(conn *websocket.Conn, id string) {
	n.lock.Lock()
	defer n.lock.Unlock()
	if len(n.Connections) == 0 {
		n.Connections = make(map[string]*websocket.Conn)
	}
	n.Connections[id] = conn
}

//RemoveConnection removes ws connection given sessionid
func (n *Notifier) RemoveConnection(id string) {
	n.lock.Lock()
	defer n.lock.Unlock()
	delete(n.Connections, id)
}

//WriteToConnections writes to all connections
func (n *Notifier) WriteToConnections(msgs <-chan amqp.Delivery) {
	for msg := range msgs {
		log.Print("goign into loop")
		n.lock.Lock()
		byteMsg := []byte(msg.Body)
		for id, conn := range n.Connections {
			if err := conn.WriteMessage(websocket.TextMessage, byteMsg); err != nil {
				log.Print("error writing message prolly not a connection")
				n.RemoveConnection(id)
				conn.Close()
			}
			log.Print("wrote message")
		}
		msg.Ack(false)
		n.lock.Unlock()
	}
}

//WsHandler fjdlskfj
func (ctx *HandlerContext) WsHandler(w http.ResponseWriter, r *http.Request) {
	//check origin?

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to open websocket connection", 401)
		return
	}

	//auth check?

	ss := &SessionState{}
	id, err := sessions.GetState(r, ctx.SigningKey, ctx.SessionStore, ss)
	if err != nil {
		http.Error(w, "Failed to get state", 500)
		return
	}

	ctx.Notifier.InsertConnection(conn, string(id))

	go (func(conn *websocket.Conn, ctx *HandlerContext, id string) {
		defer conn.Close()
		defer ctx.Notifier.RemoveConnection(id)

		for {
			messageType, p, err := conn.ReadMessage()
			if messageType == websocket.TextMessage || messageType == websocket.BinaryMessage {
				ss := &SessionState{}
				_, err := sessions.GetState(r, ctx.SigningKey, ctx.SessionStore, ss)
				if err != nil {
					http.Error(w, "Failed to get state", 500)
					return
				}
				msgStr := fmt.Sprintf("%s: %s", ss.Nickname, string(p))

				err = ctx.Channel.Publish(
					"",                //exchange
					"gamezone_rabbit", //key
					false,             //mandatory
					false,             //immediate
					amqp.Publishing{
						ContentType: "text/plain",
						Body:        []byte(msgStr),
					})
				if err != nil {
					log.Printf("Failed to publish message")
				}
			} else if messageType == websocket.CloseMessage || err != nil {
				break
			}
		}
	})(conn, ctx, string(id))
}
