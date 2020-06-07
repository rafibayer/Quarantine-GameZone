# Project: Quarantine GameZone

Group Members: Jill, Vivian, Rafael, & Amit

## Hosted Project
- [Quarantine-Gamezone](https://rafibayer.me)
- [API](https://api.rafibayer.me)

## Project description
Quarantine Game-Zone is an application that allows you to play games with others online via a web browser. Players will be able to select a game from a game lobby and add their friend(s) to play!

Our target audience is anyone looking for a way to stay social by playing games, especially during quarantine. There are many other similar services, such as Jackbox, Drawful, and more, but we want to offer a free and easy-to-use alternative. As developers, we want to create an app that we could see ourselves using. As students experiencing this unprecedented online quarter, we think it’s more important than ever to stay connected, and games are a fantastic way to do that.

## Endpoints
## Endpoints

### Sessions

- /v1/sessions
  - POST
    - 201: created a new player session
    - 403: invalid nickname forbidden
    - 415: unsupported media
    - 500: internal server error

- /v1/sessions/
  - GET
    - 400: bad request
    - 403: forbidden request if not user's session
  - DELETE
    - 400: bad request
    - 403: forbidden request if not user's session

### Game Lobbies

- /v1/gamelobby
  - POST
    - 401: created a new game lobby session
    - 400: bad request for unsupported game type
    - 401: unauthorized to create a new lobby session, must have player session
    - 415: unsupported media
    - 500: internal server error
  - GET
    - 200: ok to get game lobbies
    - 401: unauthorized to get game lobbies, must have player session
    - 500: internal server error

- /v1/gamelobby/{lobby_id}
  - POST
    - 201: added a new player to game lobby
    - 400: bad request if player is already in a game session
    - 401: unauthorized game session or must have player session
    - 403: forbidden request to add player if game is at max capacity
    - 500: internal server error
  - GET
    - 200: status ok, get game lobby state
    - 401: unauthorized to get a game lobby state, must be a player of the game lobby
    - 500: internal server error

### Games

- /v1/games/{game_id}
  - POST
    - 401: unauthorized player for the requested game session
    - 500: internal server error
  - GET
    - 401: unauthorized player for the requested game session
    - 500 internal server error

* THE FOLLOWING ENDPOINTS ARE FOR INTERNAL USE AND ARE NOT USED BY CLIENT
* THEY ARE REACHED MAKING REQUESTS TO /v1/games/

- /v1/tictactoe
  - POST
    - 201: tic-tac-toe game created from tic-tac-toe game lobby
    - 400: bad request, invalid game lobby state, invalid game type or invalid number of players
    - 415: unsupported media
    - 500: internal server error

- /v1/tictactoe/{game_id}
  - POST
    - 200: status ok, tic-tac-toe move made
    - 400: bad move request
    - 401: unauthorized player
    - 403: forbidden move request
    - 404: game state not found
    - 415: unsupported media
    - 500: internal server error
  - GET
    - 200: status ok, get tic-tac-toe game state
    - 404: game state not found
    - 500: internal server error

- /v1/trivia
  - POST
    - 201: trivia game created from trivia game lobby
    - 500: internal server error

- /v1/trivia/{game_id}
  - POST
    - 201: trivia answer made
    - 400: bad request, player already answered trivia question or invalid answer data
    - 401: unauthorized player
    - 500: internal server error
  - GET
    - 200: status ok, get trivia game state
    - 400: bad request
    - 401: unauthorized player
    - 404: game state not found

## Models
### Gateway & Lobbies
```
# Stores a users session and chosen nickname
sessionState: {  
	starTime: time.Time
    nickname: string
} 

# Used by client to create new lobby
newGameLobby: {
    game_type: string
}

# internal representation of a gamelobby
gamelobby: {
    lobby_id: string
    game_type: string
    players: [sessionID]
    capacity: int
    gameID: gameSessionID
}

# game lobby representation for client
gamelobby: {
    lobby_id:   string
    game_type:  string
    players:    [string]
    capacity:   int
    game_ready: boolean
}
```
### Tic-Tac-Toe
```

# Tic tac toe internal gamestate
TicTacToe: {
	board:   [[int]] 
	xturn:   bool     
	xid:     string   
	oid:     string   
	xname:   string   
	oname:   string   
	outcome: string   
}

# Tic tac toe move from a client
Move: {
    row: int
    col: int
}

# Tic tac toe response to client
TicTacToeResponse: {
	board:   [[int]] 
	xturn:   bool     
	xname:   string   
	oname:   string   
	outcome: string   
}
```
### Trivia
```
# Trivia Question
questionType: {
    question:       string
    answers:        [string]
    correctAnswer:  string # internal only
}

# Player
playerType: {
    sessID:          string # internal only
    nickname:        string
    score:           int
    alreadyAnswered: bool
}

# Internal Gamestate
gameStateSchema : {
    players:      [playerType]
    counter:      int
    questionBank: [questionType]
}

# Response Gamestate for client
gameStateResponse : {
    players:         [playerType]
    questionNumer:   int
    activeQuestion:  questionType
}

# Move from client
move: {
    move: int
}
```

## Use cases and priority:  

| Priority | User        | Description                               |
|----------|-------------|-------------------------------------------|
| P0       | As a player | I want to be able to create a nickname    |
| P0       | As a player | I want to be able to make a new game      |
| P0       | As a player | I want to be able to join a game          |
| P0       | As a player | I want to be able to see games I can join |
| P0       | As a player | I want to be able to play a game          |
| P1       | As a player | I want to exit a game lobby               |
| P1       | As a player | I want to exit a game after completion    |
| P1       | As a player | I want to see the result of the game      |
| P1       | As a player | I want to select different types of games |
| P2       | As a player | I want to chat with players in the lobby  |



## Original Infrastructure diagram
![Infrastructure](old-diagram.jpg)

## Current Infrastructure diagram

![Infrastructure](https://github.com/rafibayer/Quarantine-GameZone-441/blob/master/Infrastructure%20Diagram%20-%20Final.png)





