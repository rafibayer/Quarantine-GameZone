# Project: Quarantine Game-Zone
Updated Spec: https://docs.google.com/document/d/1bTPSGdqWB-4usx5t92q-fA1jr879KetxZ58KjcKz6d4/edit?usp=sharing

Group Members: Jill, Vivian, Rafael, & Amit


## Project description
Quarantine Game-Zone is an application that allows you to play games with others online via a web browser. Players will be able to select a game from a game lobby and add their friend(s) to play!

Our target audience is anyone looking for a way to stay social by playing games, especially during quarantine. There are many other similar services, such as Jackbox, Drawful, and more, but we want to offer a free and easy-to-use alternative. As developers, we want to create an app that we could see ourselves using. As students experiencing this unprecedented online quarter, we think it’s more important than ever to stay connected, and games are a fantastic way to do that.

## Endpoints
### Games lobby
- /v1/games/
    - GET; Admin purposes, see all currently running games
        - 200: Gets all games sessions that are currently happening, returns map of:
            - lobbyID: gameType
        - 500: Internal server error
- /v1/games/tictactoe 
    - POST
        - 201 created: Creates a game state on the server, sends you the initial state of the game as JSON
        - 500: Internal server error
- /v1/games/tictactoe/{lobby id}
    - GET
        - 200 ok: Returns the current state of the game
        - 401 unauthorized: Could not verify player, or they are not in the game
        - 404 not found: The game wasn’t found
        - 415: Unsupported media type
        - 500: Internal server error
    - POST
        - 201 created: Applies the move to the game, returns the updated game state as JSON
        - 400 bad request: An illegal move is given
        - 401 unauthorized: Could not verify player, or they are not in the game 
        - 404 not found: The game wasn’t found
        - 415: Unsupported media type
        - 500: Internal server error
### Players
- /v1/players
    - POST
        - 201 created: Create a new player
- Specific player
- /v1/players/{player id OR me}
    - PATCH
        - 200 ok:  update player (first name, last name)
        - 403 forbidden: not authenticated to make changes to this player profile
        - 404 not found: player not found
        - 415: Unsupported media type
    - GET
        - 200 ok: get player info
        - 403 forbidden: not authenticated to get player profile
        - 404 not found: player not found
        - 415: Unsupported media type
    - DELETE
        - 200 ok:
        - 403 forbidden: not authenticated to delete this player
        - 404 not found: player not found
        - 415: Unsupported media type
### Sessions
- /v1/sessions
    - POST
        - 201 created: Created a new session
        - 401 unauthorized: Bad credentials
        - 415: unsupported media type
        - 500: Internal server error
- Specific session
- /v1/sessions/{session id or mine}
    - DELETE
        - 403 forbidden: not mine
        - 200 ok: Ends session

## Models
```
Player: {  
	id: int,  
	username: string,  
	email: string,  
	firstname: string,  
	lastname: string,  
	passwordHash: string  
}  

NewPlayer: {  
	username: string,  
	email: string,  
        firstname: string,  
	lastname: string,  
	password: string,  
	passwordConf: string  
}  

Credentials: {  
	username:string,  
	password: string  
}  


Game: {  
	gameType: string,  
	lobbyID: string,  
	players: [playerID: int],  
	gamestate: {  
		// this is specific to each game,  
		// will contain information for client to render   gamestate  
		// such as the board in tictactoe or chess based on   gameType  
		// and for server to handle game  
		// logic such as whose turn it is  
	    }  
}  
```
Use cases and priority:  

![Use cases](https://github.com/rafibayer/Quarantine-GameZone-441/blob/master/use.JPG)


Infrastructure diagram

https://app.lucidchart.com/invitations/accept/ffb7c05e-ab8e-4cce-aa82-9e2046c505b6

![infrastructure](https://github.com/rafibayer/Quarantine-GameZone-441/blob/master/Infrastructure%20Diagram.jpeg)






