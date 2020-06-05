import React, {Component} from 'react';
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
        this.setError("");
        this.props.removeGameLobby();
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