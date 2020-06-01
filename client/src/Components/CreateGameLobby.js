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
            isPrivate: false,
            error: ""
        };
    }

    // handles changes to private public radio buttons
    handleChange = () => {
        this.setState({
            isPrivate: !this.state.isPrivate
        });
    }

    // handles select change
    handleSelect = (e) => {
        this.setState({game_type: e.target.value});
    }

    // set error message
    setError = (error) => {
        this.setState({ error });
    }

    // submit new game form
    submitForm = async (e) => {
        e.preventDefault();
        const { gameType, isPrivate } = this.state;
        const sendData = {game_type: gameType, private: isPrivate};
        const response = await fetch(api.testbase + api.handlers.gamelobbies, {
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
                        <input type="radio" id="public" name="publicgame" value="public" checked={!this.state.private} onChange={this.handleChange}></input>
                        <label for="public">Public</label>
                        <input type="radio" id="private" name="publicgame" value="private" checked={this.state.private} onChange={this.handleChange}></input>
                        <label for="private">Private</label>
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