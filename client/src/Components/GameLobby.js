import React, {Component} from 'react';
import gametypes from '../Constants/GameTypes.js'
import api from '../Constants/Endpoints.js'
import LeaveGameLobby from './LeaveGameLobby.js'
import Game from './Game.js'
import Errors from './Errors.js'

class GameLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gameReady: false,
            error: ""
        }
        this.timer = setInterval(() => this.getGameLobby(), 1000);
    }

    // polling
    componentDidMount() {
        console.log("polling has began");
    }

    componentWillUnmount() {
        this.timer = null;
    }

    // set error message
    setError = (error) => {
        this.setState({ error });
    }

    // set game is ready
    setGameIsReady = () => {
        this.setState({ gameReady: true});
    }

    // get current game state
    getGameLobby = async () => {
        var gameLobby = JSON.parse(localStorage.getItem("GameLobby"));
        var gameReady = gameLobby.game_ready;
        var id = gameLobby.lobby_id;
        if (gameReady) {
            this.setGameIsReady();
            this.timer = null;
        } else {
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
    }

    render() {
        const { gameReady, error } = this.state;
        let gameLobby = JSON.parse(localStorage.getItem("GameLobby"));
       // let gameLobbyID = gameLobby.lobby_id;
        let gameType = gameLobby.game_type;
        let players = gameLobby.players;
        let capacity = gameLobby.capacity;
        let gameTypeName = gametypes[gameType];
        var stringListOfPlayers = "";
        players.forEach(p => stringListOfPlayers += (p + " "));
        return(
            <div>
                <Errors error={error} setError={this.setError} />
                {gameReady ?
                <div>
                    <Game></Game>
                </div>
                :
                <div> 
                    <p>
                        Welcome to {gameTypeName.displayName}! <br />
                        Current players: { stringListOfPlayers } <br />
                        Waiting for {capacity - players.length} more player(s)...
                    </p>
                    <LeaveGameLobby setGameLobby={this.props.setGameLobby} removeGameLobby={this.props.removeGameLobby}></LeaveGameLobby>
                 </div>
                }
            </div>

        );
    }
}

export default GameLobby