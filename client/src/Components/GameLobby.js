import React, {Component} from 'react';
import gametypes from '../Constants/GameTypes.js'
import api from '../Constants/Endpoints.js'
import Errors from './Errors.js'

// game imports
import TicTacToe from './Games/TicTacToe.js'
import Trivia from './Games/Trivia.js'


class GameLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gameReady: false,
            error: ""
        }
        this.timer = setInterval(() => this.getGameLobby(), 3000);
    }

    componentWillUnmount() {
        this.timer = null;
    }

    // set error message
    setError = (error) => {
        this.setState({ error });
    }

    // set game is ready
    setGameIsReady = (bool) => {
        this.setState({ gameReady: bool});
    }

    // get current game state
    getGameLobby = async () => {
        var gameLobby = JSON.parse(localStorage.getItem("GameLobby"));
        if (gameLobby == null) {
            return
        }
        var gameReady = gameLobby.game_ready;
        var id = gameLobby.lobby_id;
        if (gameReady) {
            this.setGameIsReady(true);
            this.timer = null;
        } else {
            const response = await fetch(api.base + api.handlers.gamelobby + id, {
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
        let gameLobbyID = gameLobby.lobby_id;
        let gameType = gameLobby.game_type;
        let players = gameLobby.players;
        let capacity = gameLobby.capacity;
        let gameTypeName = gametypes[gameType];

        // show list of players in lobby
        var stringListOfPlayers = "";
        players.forEach(p => stringListOfPlayers += (p + " "));

        let gameContent = <></>
        switch (gameType) {
            case "tictactoe":
                gameContent = <TicTacToe gameID={gameLobbyID} removeGameLobby={this.props.removeGameLobby}></TicTacToe>;
                break;
            case "trivia":
                gameContent = <Trivia gameID={gameLobbyID} removeGameLobby={this.props.removeGameLobby}></Trivia>
                break;
            default:
                gameContent = <div>No game of this type</div>;
                break;
        }
        return(
            <div>
                <Errors error={error} setError={this.setError} />
                {gameReady ?
                <div>
                    {gameContent}
                </div>
                :
                <div> 
                    <p>
                        Welcome to {gameTypeName.displayName}! <br />
                        Current players: { stringListOfPlayers } <br />
                        Waiting for {capacity - players.length} more player(s)...
                    </p>
                 </div>
                }
            </div>

        );
    }
}

export default GameLobby