import React, {Component} from 'react';
import gametypes from '../Constants/GameTypes.js'
import api from '../Constants/Endpoints.js'
import Errors from './Errors.js'

// player creates a new game
class CreateGameLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gameType: "tictactoe",
            error: ""
        };
    }

    // handles select change
    handleSelect = (e) => {
        this.setState({gameType: e.target.value});
    }

    // set error message
    setError = (error) => {
        this.setState({ error });
    }

    // submit new game form
    submitForm = async (e) => {
        e.preventDefault();
        const { gameType } = this.state;
        const sendData = {game_type: gameType };
        const response = await fetch(api.base + api.handlers.gamelobbies, {
            method: "POST",
            body: JSON.stringify(sendData),
            headers: new Headers({
                "Authorization": localStorage.getItem("Authorization"),
                "Content-Type": "application/json"
            })
        });
        if (response.status >= 300) {
            const error = await response.text();
            this.setError(error);
            return;
        }
        const newGame = await response.json();
        localStorage.setItem("GameLobby", JSON.stringify(newGame));
        this.props.setGameLobby(newGame);
    }

    render() {
        // get display names and players for each game type
        let games = [];
        Object.values(gametypes).forEach((gameType) => {
            games.push(<option value={gameType.gameType}>{gameType.displayName}</option>);
        });
        const { error } = this.state;
        return(
            <div>
                <Errors error={error} setError={this.setError} />
                <h1>Create a New Game</h1>
                <form>
                    <div>
                        <select onChange={this.handleSelect}>
                            {games}
                        </select>
                    </div>
                    <input type="submit" value="Create Game" onClick={this.submitForm} />
                </form>
            </div>
        );
    }
}

export default CreateGameLobby