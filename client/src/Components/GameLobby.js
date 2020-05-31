import React, {Component} from 'react';
import api from '../Constants/Endpoints.js'
import LeaveGameLobby from './LeaveGameLobby.js'

class GameLobby extends Component {

    // get current game state
    getGameState = async (id) => {
        const response = await fetch(api.testbase + api.handlers.game + id, {
            headers: new Headers({
                "Authorization": localStorage.getItem("Authorization")
            })
        });
        if (response.status >= 300) {
            const error = await response.text();
            this.setError(error);
            return;
        }
    }

    render() {
        return(
            <div>
                <p>
                    This is a game lobby with ID: {this.props.lobbyID} <br />
                    Waiting for more players to join...
                </p>
                <LeaveGameLobby setInGameLobby={this.props.setInGameLobby} setGameLobbyID={this.props.setGameLobbyID}></LeaveGameLobby>
            </div>

        );
    }
}

export default GameLobby