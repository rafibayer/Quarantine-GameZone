import React, {Component} from 'react';
import api from '../Constants/Endpoints.js'
import gametypes from '../Constants/GameTypes.js'
import Errors from './Errors.js'

class JoinGameLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gameLobbies: {},
            error: ""
        }
        this.timer = setInterval(() => this.getGameLobbies(), 5000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    // sets game lobbies to join
    setGameLobbies = (games) => {
        this.setState({gameLobbies: games})
    }

    // set error message
    setError = (error) => {
        this.setState({ error })
    }

    
    // gets game lobbies for player to join
    getGameLobbies = async () => {
        const response = await fetch(api.base + api.handlers.gamelobbies, {
            headers: new Headers({
                "Authorization": localStorage.getItem("Authorization")
            })
        });
        if (response.status >= 300) {
            const error = await response.text();
            this.setError(error);
            return;
        }
        const games = await response.json();
        this.setGameLobbies(games);
    }

    // join game 
    joinGameLobby = async (e) => {
        e.preventDefault();
        var game = JSON.parse(e.target.value);
        var id = game.lobby_id;
        const response = await fetch(api.base + api.handlers.gamelobby + id, {
            method: "POST",
            headers: new Headers({
                "Authorization": localStorage.getItem("Authorization")
            })
        });
        if (response.status >= 300) {
            const error = await response.text();
            this.setError(error);
            return;
        }
        localStorage.setItem("GameLobby", JSON.stringify(game));
        this.props.setGameLobby(game);
    }

    render() {
        // get game lobbies to display
        let displayGames = [];
        Object.values(this.state.gameLobbies).forEach((game) => {
            let currentLobbyPlayers = "";
            let players = game.players;
            players.forEach(player => currentLobbyPlayers += (player + " "));
            let gameTypeName = gametypes[game.game_type];
            displayGames.push(
                <p class="lobby">
                    Game: {gameTypeName.displayName} <br /> 
                    Lobby Capacity: {players.length}/{game.capacity} <br />
                    Players: {currentLobbyPlayers}
                    <br />
                    <button value={JSON.stringify(game)} onClick={this.joinGameLobby}>Join</button>
                </p>
            );
        });
        const { error } = this.state;
        return(
            <div>
                <Errors error={error} setError={this.setError} />
                <h1>Join a Game</h1>
                <div>{displayGames}</div>
            </div>

        );
    }
}

export default JoinGameLobby