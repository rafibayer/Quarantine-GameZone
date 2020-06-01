import React, {Component} from 'react';
import gametypes from '../Constants/GameTypes.js'
import api from '../Constants/Endpoints.js'
import LeaveGameLobby from './LeaveGameLobby.js'
import Errors from './Errors.js'

class GameLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
           // currentGameLobby: JSON.parse(localStorage.getItem("GameLobby")) || null,
            error: ""
        }
        this.getGameLobby();
    }

    // set error message
    setError = (error) => {
        this.setState({ error })
    }

    // get current game state
    getGameLobby = async () => {
        var gameLobby = JSON.parse(localStorage.getItem("GameLobby"));
        var id = gameLobby.lobby_id;
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
        const gameLobbyResp = await response.json();
        localStorage.setItem("GameLobby", JSON.stringify(gameLobbyResp));
    }

    // post
    // all lobby changes (addingplayer)	-> creates a game (lets client know) ->
    // -> client now knows to send get specific game /v1/game/lobbyid(Get) (start loop) 
   /* componentDidMount() {
        console.log("polling");
        this.timer = setInterval(() => this.getGameLobby(), 5000);
    }

    componentWillUnmount() {
        this.timer = null;
    }  */

    render() {
        const { error } = this.state;
        let gameLobby = JSON.parse(localStorage.getItem("GameLobby"));
        let gameType = gameLobby.game_type;
        let players = gameLobby.players;
        let capacity = gameLobby.capacity;
        let gameTypeName = gametypes[gameType];
        var stringListOfPlayers = "";
        players.forEach(p => stringListOfPlayers += (p + " "));
        return(
            <div>
                <Errors error={error} setError={this.setError} />
                <p>
                    Welcome to {gameTypeName.displayName}! <br />
                    Current players: { stringListOfPlayers } <br />
                    Waiting for {capacity - players.length} more player(s)...
                </p>
                <LeaveGameLobby setGameLobby={this.props.setGameLobby} removeGameLobby={this.props.removeGameLobby}></LeaveGameLobby>
            </div>

        );
    }
}

export default GameLobby