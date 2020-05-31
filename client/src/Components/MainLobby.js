import React, {Component} from 'react';
import CreateGameLobby from './CreateGameLobby.js'
import GameLobby from './GameLobby.js'
import JoinGameLobby from './JoinGameLobby.js'
import ExitLobby from './ExitLobby.js'

class MainLobby extends Component {

    render() {
        return(
            <div>
                {this.props.inGameLobby ? 
                <GameLobby authToken={this.props.authToken} setInGameLobby={this.props.setInGameLobby} setGameLobbyID={this.props.setGameLobbyID} lobbyID={this.props.lobbyID} /> 
                :
                <div>
                    <h1>Hello {this.props.player}. Welcome to the Quarantine GameZone Lobby!</h1>
                    <ExitLobby setAuthToken={this.props.setAuthToken} setPlayer={this.props.setPlayer}></ExitLobby>
                    <CreateGameLobby setInGameLobby={this.props.setInGameLobby} setGameLobbyID={this.props.setGameLobbyID}></CreateGameLobby>
                    <JoinGameLobby setInGameLobby={this.props.setInGameLobby} setGameLobbyID={this.props.setGameLobbyID}></JoinGameLobby>
                </div>
                }
            </div>
        );
    }
}

export default MainLobby