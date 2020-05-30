import React, {Component} from 'react';
import CreateGame from './CreateGame.js'
import GameRouter from './GameRouter.js'
import JoinGame from './JoinGame.js'
import ExitLobby from './ExitLobby.js'

class Lobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inGame: false,
            gameID: null
        }
    }

    // sets status to ingame (includes in waiting lobby)
    setInGame = () => {
        this.setState({ inGame: !this.state.inGame});
    }

    // set joined game id
    setGameID = (id) => {
        this.setState({gameID: id});
    }

    // set error message
    setError = (error) => {
        this.setState({ error });
    }
    
    render() {
        const { inGame } = this.state;
        return(
            <div>
                {inGame ? 
                <GameRouter gameID={this.state.gameID} /> 
                :
                <div>
                    <h1>Hello {this.props.playerNickname}. Welcome to the Quarantine GameZone Lobby!</h1>
                    <ExitLobby setAuthToken={this.props.setAuthToken} setPlayer={this.props.setPlayer}></ExitLobby>
                    <CreateGame authToken={this.props.authToken} setInGame={this.setInGame} setGameID={this.setGameID}></CreateGame>
                    <JoinGame authToken={this.props.authToken} setInGame={this.setInGame} setGameID={this.setGameID}></JoinGame>
                </div>
                }
            </div>
        );
    }
}

export default Lobby