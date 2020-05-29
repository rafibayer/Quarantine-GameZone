import React, {Component} from 'react';
import CreateGame from './CreateGame.js'
import JoinGame from './JoinGame.js'
import ExitLobby from './ExitLobby.js'

class Lobby extends Component {
    // set error message
    setError = (error) => {
        this.setState({ error })
    }
    
    render() {
        return(
            <div>
                <h1>Hello {this.props.playerNickname}. Welcome to the Quarantine GameZone Lobby!</h1>
                <ExitLobby setAuthToken={this.props.setAuthToken} setPlayer={this.props.setPlayer}></ExitLobby>
                <CreateGame></CreateGame>
                <JoinGame></JoinGame>
            </div>

        );
    }
}

export default Lobby