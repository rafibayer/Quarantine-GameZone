import React, {Component} from 'react';
import CreateGameLobby from './CreateGameLobby.js'
import GameLobby from './GameLobby.js'
import JoinGameLobby from './JoinGameLobby.js'
import ExitLobby from './ExitLobby.js'
import ChatLobby from './ChatLobby.js'
import api from '../Constants/Endpoints.js'


class MainLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
          gameLobby: JSON.parse(localStorage.getItem("GameLobby")) || null,
          error: ""
        };
        this.setGameLobby = this.setGameLobby.bind(this);
        this.removeGameLobby = this.removeGameLobby.bind(this);
    }

    // componentDidMount() {
    //     window.addEventListener("beforeunload", (ev) => 
    //     {  
    //         ev.preventDefault();
    //         this.removeGameLobby();
    //         return;
    //     });      
    // }
          
    // set error message
    setError = (error) => {
        this.setState({ error })
    }

    // sets the game lobby data in state
    setGameLobby = (gameLobby) => {
        this.setState({
            gameLobby: gameLobby
        });
        localStorage.setItem("GameLobby", JSON.stringify(gameLobby));
    }

    // remove game lobby data in state 
    removeGameLobby = async() => {
        let game = localStorage.getItem("GameLobby");
        game = JSON.parse(game);
        var id = game.lobby_id;
        const response = await fetch(api.base + api.handlers.gamelobby + id, {
            method: "PATCH",
            headers: new Headers({
                "Authorization": localStorage.getItem("Authorization")
            })
        });
        if (response.status >= 300) {
            const error = await response.text();
            this.setError(error);
            return;
        }
        this.setState({
            gameLobby: null
        });
        localStorage.setItem("GameLobby", null);
    }
    
    render() {
        const { gameLobby } = this.state;
        return(
            <div>
                {gameLobby ? 
                <GameLobby setGameLobby={this.setGameLobby} removeGameLobby={this.removeGameLobby} /> 
                :
                <div>
                    <h1>Hello {this.props.player}. Welcome to the Quarantine GameZone Lobby!</h1>
                    <ExitLobby setAuthToken={this.props.setAuthToken} setPlayer={this.props.setPlayer} setGameLobbyID={this.setGameLobbyID}></ExitLobby>
                    <CreateGameLobby setGameLobby={this.setGameLobby}></CreateGameLobby>
                    <JoinGameLobby setGameLobby={this.setGameLobby}></JoinGameLobby>
                    <ChatLobby setAuthToken={this.props.setAuthToken}></ChatLobby>
                </div>
                }
            </div>
        );
    }
}

export default MainLobby