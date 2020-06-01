import React, {Component} from 'react';
import gametypes from '../Constants/GameTypes.js'
import LeaveGameLobby from './LeaveGameLobby.js'
import Errors from './Errors.js'

class GameLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: ""
        }
        this.props.getGameLobbyState();
    }

    // set error message
    setError = (error) => {
        this.setState({ error })
    }


    // post
    // all lobby changes (addingplayer)	-> creates a game (lets client know) ->
    // -> client now knows to send get specific game /v1/game/lobbyid(Get) (start loop) 

    render() {
        const { error } = this.state;
        let gameLobby = JSON.parse(localStorage.getItem("GameLobby"));
        let gameType = gameLobby.game_type;
        let players = gameLobby.players;
        let capacity = gameLobby.capacity;
        let gameTypeName = gametypes[gameType];
        console.log(gameType);
        console.log(gametypes);
        console.log(gameTypeName);
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
                <LeaveGameLobby setGameLobbyID={this.props.setGameLobbyID} removeGameLobbyState={this.props.removeGameLobbyState}></LeaveGameLobby>
            </div>

        );
    }
}

export default GameLobby