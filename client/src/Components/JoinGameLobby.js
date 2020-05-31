import React, {Component} from 'react';
import api from '../Constants/Endpoints.js'
import Errors from './Errors.js'

class JoinGameLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            public_games: {},
            error: ""
        }
        //this.getPublicGames();
    }

    // sets public games
    setPublicGames = (games) => {
        this.setState({public_games: games})
    }

    // set error message
    setError = (error) => {
        this.setState({ error })
    }

    /*
    // gets recent public games for player to join
    getPublicGames = async () => {
        const response = await fetch(api.testbase + api.handlers.gamelobbies, {
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
*/

    // join game (post request to specific lobby handler)
    joinGame = async (e) => {
        e.preventDefault();
        const response = await fetch(api.testbase + api.handlers.gamelobbies, {
            method: "POST",
            headers: new Headers({
                "Authorization": localStorage.getItem("Authorization")
            })
        });
        if (response.status >= 300) {
            const error = await response.text();
            this.setError(error);
            return;
        }
        var id = e.target.value;
        this.props.setGameLobbyID(id);
        localStorage.setItem("GameLobbyID", id);
    }

    render() {
        // get public games to display
       /* let displayPublicGames = [];
        Object.values(this.state.public_games).forEach((game) => { ;
            displayPublicGames.push(<li>Game Type: {game.game_type} <button value={game.game_id} onClick={this.joinGame}>Join</button></li>);
        });*/
        const { error } = this.state;
        return(
            <div>
                <Errors error={error} setError={this.setError} />
                <h1>Join a Public Game</h1>
                <ul><li>placeholder until get all public games is ready</li></ul>
            </div>

        );
    }
}

export default JoinGameLobby