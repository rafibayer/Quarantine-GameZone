import React, {Component} from 'react';
import CreateGameLobby from './CreateGameLobby.js'
import GameLobby from './GameLobby.js'
import JoinGameLobby from './JoinGameLobby.js'
import ExitLobby from './ExitLobby.js'

class MainLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
          gameLobbyID: localStorage.getItem("GameLobbyID") || null,
          error: ""
        };
        this.setGameLobbyID = this.setGameLobbyID.bind(this);
      }

    // set joined game id
    setGameLobbyID = (id) => {
        this.setState({gameLobbyID: id});
        localStorage.setItem("GameLobbyID", id);
    }

    render() {
        const { gameLobbyID } = this.state;
        return(
            <div>
                {gameLobbyID ? 
                <GameLobby setGameLobbyID={this.setGameLobbyID} /> 
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