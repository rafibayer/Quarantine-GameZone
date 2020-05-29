import React, {Component} from 'react';
import api from '../Constants/Endpoints.js';
import Errors from './Errors.js';

class ExitLobby extends Component {
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

    handleExit = async (e) => {
        e.preventDefault();
        const response = await fetch(api.testbase + api.handlers.player, {
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
        localStorage.removeItem("Authorization");
        this.setError("");
        this.props.setAuthToken("");
        this.props.setPlayer(null);

    }

    render() {
        const { error } = this.state;
        return(
            <div>
                <Errors error={error} setError={this.setError} />
                <button onClick={this.handleExit}>Exit Lobby</button>
            </div>
        );
    }
}

export default ExitLobby