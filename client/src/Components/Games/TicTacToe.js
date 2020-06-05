import React, {Component} from 'react';
import LeaveGameLobby from '../LeaveGameLobby.js'
import Errors from '../Errors.js'
import api from '../../Constants/Endpoints.js'
import '../../Styles/TicTacToe.css';

class TicTacToe extends Component {
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
        console.log("game tictactoe polling has begun");
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
        const response = await fetch(api.base + api.handlers.game + this.props.gameID, {
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

    // makes a post request providing move data
    makeMove = async (e) => {
        e.preventDefault();
        var move = JSON.parse(e.target.value);
        const sendData = {row: move.rowPos, col: move.colPos};
        const response = await fetch(api.base + api.handlers.game + this.props.gameID, {
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
        } else if (outcome !== "In-Progress") {
            clearInterval(this.timer);
            var result = "";
            if (outcome === "1 has won") {
                result = gameState.xname + " has won!";
            } else if (outcome === "2 has one") {
                result = gameState.oname + " has won!";
            } else {
                result = "Draw";
            }
            return(
                <div>
                    <Errors error={error} setError={this.setError} />
                    <h1>Tic-Tac-Toe</h1>
                    {result}
                    <LeaveGameLobby removeGameLobby={this.props.removeGameLobby}></LeaveGameLobby>
                </div>
            );
        } else {
            let displayBoard = [];
            let currentBoard = gameState.Board;

            // read in current board state to tic toe toe board 
            for (var col = 0; col < 3; col++) {
                for (var row = 0; row < 3; row++) {
                    var marker = currentBoard[row][col];
                    var xoMarker = "";
                    switch (marker) {
                        case 1:
                            xoMarker = "x";
                            break;
                        case 2:
                            xoMarker = "o";
                            break;
                        default:
                            xoMarker = <p> </p>;
                            break;
                    }
                    var buttonPos = {rowPos: row, colPos: col}
                    displayBoard.push(<button id="tic-tac-toe-btn" value={JSON.stringify(buttonPos)} onClick={this.makeMove}>{xoMarker}</button>);
                }
                displayBoard.push(<br />);
            }
            return(
                <div>
                    <Errors error={error} setError={this.setError} />
                    <h1>Tic-Tac-Toe</h1>
                    {displayBoard}
                </div>
            );
        }
    }
}

export default TicTacToe