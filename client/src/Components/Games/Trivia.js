import React, {Component} from 'react';
import LeaveGameLobby from '../LeaveGameLobby.js'
import Errors from '../Errors.js'
import api from '../../Constants/Endpoints.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHourglass } from '@fortawesome/free-solid-svg-icons'

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

    // set whether to reload question display
    setReloadQuestion = (bool) => {
        this.setState({reloadQuestion: bool});
    }

    // set question number
    setQuestionNumber = (num) => {
        this.setState({currentQuestionNumber: num});
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

    // makes a post request providing player's answer to question
    makeMove = async (e) => {
        e.preventDefault();
        var answer = e.target.value;
        var sendData = {move: answer};
        const response = await fetch(api.testbase + api.handlers.game + this.props.gameID, {
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
        } else {
            // get trivia players info
            let playerInfos = gameState.playerInfos;
            let playerDisplays = [];
            for (var i = 0; i < playerInfos.length; i++) {
                var playerInfo = playerInfos[i];
                if (playerInfo.alreadyAnswered) {
                    playerDisplays.push(<p>{playerInfo.nickname}: {playerInfo.score}</p>)
                } else {
                    if (outcome === "ended") {
                        playerDisplays.push(<p>{playerInfo.nickname}: {playerInfo.score}</p>);
                    } else {
                        playerDisplays.push(<p><FontAwesomeIcon icon={faHourglass} /> {playerInfo.nickname}: {playerInfo.score}</p>);
                    }
                }
            }
            // checks to see if the game has ended
            // display final scoreboard
            if (outcome === "ended") {
                clearInterval(this.timer);
                return(
                    <div>
                        <Errors error={error} setError={this.setError} />
                        <h1>Trivia</h1>
                        <h2>Final Score Board</h2>
                        <div>{playerDisplays}</div>
                        <LeaveGameLobby removeGameLobby={this.props.removeGameLobby}></LeaveGameLobby>
                    </div>
                );
            } else {
                // in progress game
                // display current score board and answer buttons 
                let answerBtns = [];
                let activeQuestion = gameState.activeQuestion;
                let currentQuestionNumber = gameState.questionNumber;
                let answers = activeQuestion.answers;
                for (var i = 0; i < answers.length; i++) {
                    answerBtns.push(<button id="trivia-answer-btn" value={i} onClick={this.makeMove}>{atob(answers[i])}</button>);
                }
                return(
                    <div>
                        <Errors error={error} setError={this.setError} />
                        <h1>Trivia</h1>
                        <h2>Score Board</h2>
                        <div>{playerDisplays}</div>
                        <h2>Question {currentQuestionNumber + 1}: {atob(activeQuestion.question)}</h2>
                        {answerBtns}
                    </div>
                );
            }
        }
    }
}

export default Trivia