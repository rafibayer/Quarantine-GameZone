import React, {Component} from 'react';
import api from '../Constants/Endpoints.js'
import LeaveGame from './LeaveGame.js'

class GameRouter extends Component {

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
        const games = await response.json();
        this.setPublicGames(games);
    }


    render() {
        return(
            <div>
                This is a game lobby with ID: {this.props.gameID}
                <LeaveGame setInGame={this.props.setInGame} setGameID={this.props.setGameID}></LeaveGame>
            </div>

        );
    }
}

export default GameRouter