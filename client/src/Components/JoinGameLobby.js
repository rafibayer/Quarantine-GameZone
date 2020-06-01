import React, {Component} from 'react';
import api from '../Constants/Endpoints.js'
import gametypes from '../Constants/GameTypes.js'
import Errors from './Errors.js'

class JoinGameLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            publicGames: {},
            error: ""
        }
        this.getPublicGames();
    }

    // sets public games
    setPublicGames = (games) => {
        this.setState({publicGames: games})
    }

    // set error message
    setError = (error) => {
        this.setState({ error })
    }

    
    // gets recent public games for player to join
    getPublicGames = async () => {
        const response = await fetch(api.testbase + api.handlers.gamelobbies, {
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
        this.setPublicGames(games);
    }

    // join game 
    joinGame = async (e) => {
        e.preventDefault();
        var game = JSON.parse(e.target.value);
        console.log("checking join game game object");
        console.log(game);
        var id = game.lobby_id;
        const response = await fetch(api.testbase + api.handlers.gamelobby + id, {
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
        // get public games to display
        let displayPublicGames = [];
        Object.values(this.state.publicGames).forEach((game) => {
            let gameTypeName = gametypes[game.game_type];
            displayPublicGames.push(
                <p>
                    Game: {gameTypeName.displayName} <br /> 
                    Lobby Capacity: {game.players.length}/{game.capacity} <br />
                    {console.log("adding game object to button")}
                    {console.log(game)}
                    <button value={JSON.stringify(game)} onClick={this.joinGame}>Join</button>
                </p>
            );
        });
        const { error } = this.state;
        return(
            <div>
                <Errors error={error} setError={this.setError} />
                <h1>Join a Public Game</h1>
                <div>{displayPublicGames}</div>
            </div>

        );
    }
}

export default JoinGameLobby