import React, {Component} from 'react';
import api from '../Constants/Endpoints.js'
import LeaveGameLobby from './LeaveGameLobby.js'
import Errors from './Errors.js'

class GameLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gameType: "",
            players: [],
            capacity: 0,
            error: ""
        }
        this.getGameLobbyState();
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
        this.setGameLobbyState(gameLobby.game_type, gameLobby.players, gameLobby.capacity);
    }

    // set error message
    setError = (error) => {
        this.setState({ error })
    }

    // sets the game lobby data in state
    setGameLobbyState = (gameType, players, capacity) => {
        this.setState({
            gameType: gameType, players: players, capacity: capacity
        });
    }

    // post
    // all lobby changes (addingplayer)	-> creates a game (lets client know) ->
    // -> client now knows to send get specific game /v1/game/lobbyid(Get) (start loop) 

    render() {
        const { gameType, players, capacity, error } = this.state;
        var stringListOfPlayers = "";
        players.forEach(p => stringListOfPlayers += (p + " "));
        return(
            <div>
                <Errors error={error} setError={this.setError} />
                <p>
                    Welcome to {gameType}! <br />
                    Current players: { stringListOfPlayers } <br />
                    Waiting for {capacity - players.length} more players...
                </p>
                <LeaveGameLobby setGameLobbyID={this.props.setGameLobbyID}></LeaveGameLobby>
            </div>

        );
    }
}

export default GameLobby