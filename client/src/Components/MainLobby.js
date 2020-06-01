import React, {Component} from 'react';
import CreateGameLobby from './CreateGameLobby.js'
import GameLobby from './GameLobby.js'
import JoinGameLobby from './JoinGameLobby.js'
import ExitLobby from './ExitLobby.js'
import api from '../Constants/Endpoints.js'
import Errors from './Errors.js';

class MainLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
          gameLobbyID: localStorage.getItem("GameLobbyID") || null,
          gameLobby: localStorage.getItem("GameLobby") || null,
          error: ""
        };
        this.setGameLobbyID = this.setGameLobbyID.bind(this);
        this.getGameLobbyState = this.getGameLobbyState.bind(this);
        this.removeGameLobbyState = this.removeGameLobbyState.bind(this);
    }
    
    // set error message
    setError = (error) => {
        this.setState({ error })
    }

    // set joined game id
    setGameLobbyID = (id) => {
        this.setState({gameLobbyID: id});
        localStorage.setItem("GameLobbyID", id);
    }

    // sets the game lobby data in state
    setGameLobbyState = (gameLobby) => {
        this.setState({
           gameLobby: gameLobby
        });
        localStorage.setItem("GameLobby", JSON.stringify(gameLobby));
    }

    // remove game lobby data in state 
    removeGameLobbyState = () => {
        this.setState({
            gameLobby: null
        });
        localStorage.removeItem("GameLobby");
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
        this.setGameLobbyState(gameLobby);
    }

    render() {
        const { gameLobbyID, error } = this.state;
        return(
            <div>
                <Errors error={error} setError={this.setError} />
                {gameLobbyID ? 
                <GameLobby setGameLobbyID={this.setGameLobbyID} getGameLobbyState={this.getGameLobbyState} removeGameLobbyState={this.removeGameLobbyState} /> 
                :
                <div>
                    <h1>Hello {this.props.player}. Welcome to the Quarantine GameZone Lobby!</h1>
                    <ExitLobby setAuthToken={this.props.setAuthToken} setPlayer={this.props.setPlayer} setGameLobbyID={this.setGameLobbyID}></ExitLobby>
                    <CreateGameLobby setGameLobbyID={this.setGameLobbyID}></CreateGameLobby>
                    <JoinGameLobby setGameLobbyID={this.setGameLobbyID}></JoinGameLobby>
                </div>
                }
            </div>
        );
    }
}

export default MainLobby