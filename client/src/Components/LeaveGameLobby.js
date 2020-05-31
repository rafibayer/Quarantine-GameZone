import React, {Component} from 'react';
import api from '../Constants/Endpoints.js';
import Errors from './Errors.js';

class LeaveGameLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: ""
        };
    }

    // set error message
    setError = (error) => {
        this.setState({ error })
    }

    // handles exiting a game lobby or game
    handleExit = async (e) => {
        e.preventDefault();
        /* add this when there is a delete handler
        const response = await fetch(api.testbase + api.handlers.games, {
            method: "DELETE",
            headers: new Headers({
                "Authorization": localStorage.getItem("Authorization")
            })
        });
        if (response.status >= 300) {
            const error = await response.text();
            this.setError(error);
            return;
        }
        */
        localStorage.setItem("InGameLobby", false);
        localStorage.setItem("GameLobbyID", null);
        this.setError("");
        this.props.setInGameLobby(false);
        this.props.setGameLobbyID(null);
    }

    render() {
        const { error } = this.state;
        return(
            <div>
                <Errors error={error} setError={this.setError} />
                <button onClick={this.handleExit}>Exit Game</button>
            </div>
        );
    }
}

export default LeaveGameLobby