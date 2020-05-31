import React, {Component} from 'react';
import api from '../Constants/Endpoints.js'
import LeaveGameLobby from './LeaveGameLobby.js'
import Errors from './Errors.js'

class GameLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            responseGameLobby: {},
            error: ""
        }
       // this.getGameLobbyState();
    }

    // get current game state
    getGameLobbyState = async () => {
        var id = localStorage.getItem("GameLobbyID");
        const response = await fetch(api.testbase + api.handlers.gamelobby + id, {
            headers: new Headers({
                "Authorization": localStorage.getItem("Authorization")
            })
        });
        if (response.status >= 300) {
            const error = await response.text();
            this.setError(error);
            return;
        }
        const gameLobby = await response.json();
        console.log("got game lobby");
        console.log(gameLobby.lobby_id);
       // this.setGameLobbyState(gameLobby);
    }

    // set error message
    setError = (error) => {
        this.setState({ error })
    }

    // sets the game lobby data in state
    setGameLobbyState = (gameLobby) => {
        this.setState({
            responseGameLobby: gameLobby
        });
    }

    // post
    // all lobby changes (addingplayer)	-> creates a game (lets client know) ->
    // -> client now knows to send get specific game /v1/game/lobbyid(Get) (start loop) 

    render() {
        const { error } = this.state;
       /* var stringListOfPlayers = "";
        responseGameLobby.players.forEach(p => stringListOfPlayers += (p + " "));*/
        return(
            <div>
                <Errors error={error} setError={this.setError} />
                {localStorage.getItem("GameLobbyID")}
                <LeaveGameLobby setGameLobbyID={this.props.setGameLobbyID}></LeaveGameLobby>
            </div>

        );
    }
}
/*
                <p>
                    Welcome to {responseGameLobby.game_type}! <br />
                    Current players: { stringListOfPlayers } <br />
                    Waiting for {responseGameLobby.capacity - responseGameLobby.players.length} more players...
                </p>
*/
export default GameLobby