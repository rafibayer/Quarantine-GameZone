import React, {Component} from 'react';
import gametypes from '../Constants/GameTypes.js'
import api from '../Constants/Endpoints.js'
import Errors from './Errors.js'

class CreateGame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            game_type: "",
            is_private: false,
            players: [this.props.playerSession],
            error: ""
        };
    }

    handleChange = (e) => {
        this.setState({
            checked: e.target.value
        });
    }

    // set error message
    setError = (error) => {
        this.setState({ error })
    }

    // submit new game form
    submitForm = async (e) => {
        e.preventDefault();
        const {game_type, is_private, players} = this.state;
        const sendData = {game_type, is_private, players};
        const response = await fetch(api.testbase + api.handlers.games, {
            method: "POST",
            body: JSON.stringify(sendData),
            headers: new Headers({
                "Content-Type": "application/json"
            })
        });
        if (response.status >= 300) {
            const error = await response.text();
            this.setError(error);
            return;
        }
    }

    render() {
        // get display names and players for each game type
        let games = [];
        Object.values(gametypes).forEach((gameType) => { ;
            games.push(<option value={gameType}>{gameType.displayName}</option>);
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
                        <select>
                            {games}
                        </select>
                    </div>
                    <input type="submit" value="Create Game" onSubmit={this.submitForm} />
                </form>
            </div>
        );
    }
}

export default CreateGame