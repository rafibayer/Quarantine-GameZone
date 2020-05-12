from flask import Flask
from flask import g
from markupsafe import escape
from flask import request
from flask import Response
import json
import manager
import tictactoe

app = Flask(__name__)

game_manager = manager.Manager()

# given a lobbyid and corresponding lobby
# returns json representation for client 
def game_json(lobbyid, lobby):
    res = {
        "lobbyID":lobbyid,
        "xPlayerID":lobby["xPlayerID"],
        "oPlayerID":lobby["oPlayerID"],
        "game":lobby["game"].to_dict()
    }
    return json.dumps(res)


@app.route('/v1/games/tictactoe', methods=["POST"])
def newgame():
    # TODO
    # AUTHENTICATE REQUEST FIRST
    # ...
    # GET PlayerID of both Players
    # ...
    # Create new

    if request.mimetype != "application/json":
        return Response("Unsupported Media Type", 415)


    global game_manager
    print(f"current manager state: {game_manager.games}")
    data = request.get_json()
    # these player id's (or at least the hosts) probably have to come from auth server
    xPlayerID = data["xPlayerID"]
    oPlayerID = data["oPlayerID"]

    lobbyID = game_manager.new_lobby(xPlayerID, oPlayerID)
    lobby = game_manager.get_lobby(lobbyID)
    

    # return json and 201 created
    return Response(game_json(lobbyID, lobby), mimetype="application/json", status=201)

@app.route("/v1/games/tictactoe/<lobbyid>", methods=["GET","POST","DELETE"])
def getgame(lobbyid):
    # TODO
    # AUTHENTICATE REQUEST FIRST
    # ...
    # GET PlayerID requester
    # ...

    lobbyID = "%s" % escape(lobbyid)
    global game_manager

    if request.method == "GET":
        # TODO: CHECK IF REQUESTER IS IN THIS GAME FIRST, OTHERWISE, UNAUTHORIZED
        try:
            lobby = game_manager.get_lobby(lobbyID)
            return Response(game_json(lobbyID, lobby), mimetype="application/json", status=200)

        except KeyError:
            # game wasn't found
            return Response(f"Lobby {lobbyID} not found", 404)

    if request.method == "POST":
        if request.mimetype != "application/json":
            return Response("Unsupported Media Type", 415)

        # TODO: make move
        # Normally the playerID would be retrieved from the session to authenticate
        # for now, we assume the request is truthful about the playerID
        data = request.get_json()
        playerID = data["playerID"] # TODO: use auth header to get this value

        try:
            lobby = game_manager.get_lobby(lobbyID)

            # this is the ID of the player who we expect to move now (whoever's turn it is)
            expectedID = lobby["xPlayerID"] if lobby["game"].x_turn else lobby["oPlayerID"]
            if expectedID != playerID:
                return Response(f"It is not currently your turn", status=400)

            # apply the move
            try:
                x, y = int(data["x"]), int(data["y"])
                lobby["game"].move(x, y)
                return Response(game_json(lobbyID, lobby), mimetype="application/json", status=201)

            except ValueError as ve:
                return Response(f"Illegal move: {ve}", status=400)


        except KeyError:
            # game wasn't found
            return Response(f"Lobby {lobbyID} not found", 404)

    if request.method == "DELETE":
        #TODO: delete game if player is member
        pass




if __name__ == '__main__':
      app.run(host='0.0.0.0', port=80)
