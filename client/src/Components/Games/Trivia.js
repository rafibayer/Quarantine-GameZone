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
            currentQuestionNumber: 0,
            reloadQuestion: true,
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
        this.setState({gameState: gameState, loading: false, error: ""});
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
        if (gameResp.questionNumber > this.state.currentQuestionNumber) {
            this.setQuestionNumber(gameResp.questionNumber);
            this.setReloadQuestion(true);
        }
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
        const { gameState, loading, currentQuestionNumber, reloadQuestion, error } = this.state;

        // checks to see if the first get has finished first
        if (loading) {
            return (
                <div>
                    Entering Game...
                </div>
            );
        }
        let playerInfos = gameState.playerInfos;
        let playerDisplays = [];
        for (var i = 0; i < playerInfos.length; i++) {
            var playerInfo = playerInfos[i];
            playerDisplays.push(<p>{playerInfo.nickname}: {playerInfo.score}</p>);
        }
        if (reloadQuestion) {
            let answerBtns = [];
            let activeQuestion = gameState.activeQuestion;
            let answers = activeQuestion.answers;
            for (var i = 0; i < answers.length; i++) {
                answerBtns.push(<button id="trivia-answer-btn" value={i} onClick={this.makeMove}>{answers[i]}</button>);
            }
            return(
                <div>
                    <Errors error={error} setError={this.setError} />
                    <h1>Trivia</h1>
                    <h2>Score Board</h2>
                    <div>{playerDisplays}</div>
                    <h2>Question {currentQuestionNumber}: {activeQuestion.question}</h2>
                    {answerBtns}
                </div>
            );
        } else {
            return(
                <div>
                    <Errors error={error} setError={this.setError} />
                    <h1>Trivia</h1>
                    <h2>Score Board</h2>
                    <div>{playerDisplays}</div>
                    <div>Waiting for next question...</div>
                </div>
            );
        }
    }
}

export default Trivia