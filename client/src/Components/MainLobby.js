import React, {Component} from 'react';
import CreateGame from './CreateGame.js'
import GameRouter from './GameRouter.js'
import JoinGame from './JoinGame.js'
import ExitLobby from './ExitLobby.js'

class MainLobby extends Component {

    render() {
        return(
            <div>
                {this.props.inGame ? 
                <GameRouter authToken={this.props.authToken} setInGame={this.props.setInGame} setGameID={this.props.setGameID} gameID={this.props.gameID} /> 
                :
                <div>
                    <h1>Hello {this.props.player}. Welcome to the Quarantine GameZone Lobby!</h1>
                    <ExitLobby setAuthToken={this.props.setAuthToken} setPlayer={this.props.setPlayer}></ExitLobby>
                    <CreateGame setInGame={this.props.setInGame} setGameID={this.props.setGameID}></CreateGame>
                    <JoinGame setInGame={this.props.setInGame} setGameID={this.props.setGameID}></JoinGame>
                </div>
                }
            </div>
        );
    }
}

/*
const MainLobby = ({ player, setAuthToken, setPlayer, setInGame, setGameID, inGame, gameID }) => {
    let content = <></>
    if (inGame) {
        content = <GameRouter gameID={gameID}></GameRouter>
    } else {
        content =                 
        <div>
            <h1>Hello {player}. Welcome to the Quarantine GameZone Lobby!</h1>
            <ExitLobby setAuthToken={setAuthToken} setPlayer={setPlayer}></ExitLobby>
            <CreateGame setInGame={setInGame} setGameID={setGameID}></CreateGame>
            <JoinGame setInGame={setInGame} setGameID={setGameID}></JoinGame>
        </div>
    }
    return <>
        {content}
    </>
}*/

export default MainLobby