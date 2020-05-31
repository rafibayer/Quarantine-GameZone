import React, {Component} from 'react';
import api from '../Constants/Endpoints.js'
import LeaveGameLobby from './LeaveGameLobby.js'

class GameLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            game_type: "",
            players: [],
            capacity: null,
            error: ""
        }
        this.getGameLobbyState();
    }

    // get current game state
    getGameLobbyState = async () => {
        console.log(this.props.lobbyID);
        const response = await fetch(api.testbase + api.handlers.gamelobby + this.props.gameLobbyID, {
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
        this.setGameLobbyState(gameLobby);
    }

    // set error message
    setError = (error) => {
        this.setState({ error })
    }

    // sets the game lobby data in state
    setGameLobbyState = (gameLobby) => {
        this.setState({
            game_type: gameLobby.game_type, 
            players: gameLobby.players,
            capacity: gameLobby.capacity
        });
    }

    // post
    // all lobby changes (addingplayer)	-> creates a game (lets client know) ->
    // -> client now knows to send get specific game /v1/game/lobbyid(Get) (start loop) 

    render() {
        const { game_type, players, capacity } = this.state;
        var stringListOfPlayers = "";
        players.forEach(p => stringListOfPlayers += (p + " "))
        return(
            <div>
                <p>
                    Welcome to {game_type}! <br />
                    Current players: { stringListOfPlayers } <br />
                    Waiting for {capacity - players.length} more players...
                </p>
                <LeaveGameLobby setInGameLobby={this.props.setInGameLobby} setGameLobbyID={this.props.setGameLobbyID}></LeaveGameLobby>
            </div>

        );
    }
}

export default GameLobby