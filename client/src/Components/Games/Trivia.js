import React, {Component} from 'react';
import LeaveGameLobby from '../LeaveGameLobby.js'
import Errors from '../Errors.js'
import api from '../../Constants/Endpoints.js'

class Trivia extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gameState: null,
            loading: true,
            outcome: "", 
            error: ""
        }
        this.timer = setInterval(() => this.getState(), 2000);
    }

    componentWillMount() {
        console.log("game trivia has began polling");
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    // set error message
    setError = (error) => {
        this.setState({ error });
    }

    // sets current game state
    setGameState = (gameState) => {
        this.setState({gameState: gameState, loading: false, outcome: gameState.outcome, error: ""});
    }

    // get current game state
    getState = async () => {
        const response = await fetch(api.testbase + api.handlers.game + this.props.gameID, {
            headers: new Headers({
                "Authorization": localStorage.getItem("Authorization")
            })
        });
        if (response.status >= 300) {
            clearInterval(this.timer);
            const error = await response.text();
            this.setError(error);
            return;
        }
        const gameResp = await response.json();
        this.setGameState(gameResp);
    }
    

    render() {
        // make the display board from current game state
        const { gameState, loading, outcome, error } = this.state;

        // checks to see if the first get has finished first
        if (loading) {
            return (
                <div>
                    Entering Game...
                </div>
            );
        }
        return(
            <div>
                <Errors error={error} setError={this.setError} />
                <h1>Trivia</h1>
            </div>
        );
    }
}

export default Trivia