const fetch = require("node-fetch");
const config = require('./config');
const axios = require("axios")

//gets the nicknames that corespond to the sessionIDs from the game lobby
// this is in order to display the nicknames back to the user in the response
const getNicknames = async (players) => {
    playersArr = Promise.all(players.map(async (p, i) => {
        const options = {
            headers: {
                Authorization: "Bearer " + p
            },
        }
        try {
            const resp = await axios.get("https://api.rafibayer.me/v1/sessions/mine", options)
            if (resp.data) {
                player = {
                    sessID: p,
                    nickname: await resp.data,
                    score: 0,
                    alreadyAnswered: false
                };
                return await player
            }
        } catch (error) {
            console.error(error)
        }
    }))
    return await playersArr;
}

//postGameHandler creates a game states and maps it to an ID for that game
const postGameHandler = async (req, res, next, { GameState }) => {
    let questions = await fetchQuestions(res);
    const { lobby_id, game_type, players, capacity, gameID } = req.body;
    let playersArr = await getNicknames(players);
    const gameState = {
        players: playersArr,
        counter: 0,
        questionBank: questions,
        outcome: "in-progress"
    }
    const saveGameState = new GameState(gameState);
    saveGameState.save((err, newGameState) => {
        if (err) {
            res.status(500).send('Unable to create a trivia game');
            return;
        }
        let response = {
            "gameid": newGameState._id
        }
        return res.status(201).json(response);
    })
}

//getSpecificGameHandler gets the gameID from url, and fetches the game state,
// parsing into a response that includes an active question, non-sensitive player info and counter
// it also makes sure to shuffle the answers for the active question
const getSpecificGameHandler = async (req, res, next, { GameState }) => {
    GameState.findOne({ _id: req.params.gameid }).exec().then(gameState => {
        if (gameState == undefined) {
            return res.status(400).send("game wasn't found");
        }
        if (!req.get("Authorization")) {
            return res.status(401).send("unauthorized access")
        }
        let auth = req.get("Authorization").split(" ")[1]
        if (gameState.players.some(p => p.sessID == auth)) {
            let responseGameState = convertToResponseGamestate(gameState);
            return res.status(200).json(responseGameState);
        } else {
            return res.status(401).send("unauthorized access")
        }
    }).catch(err => {
        return res.status(404).send("couldn't find trivia game");
    })
}

//method converts the gamestate into a respone json for client,
//  includes active question with no answer and non-sensitive player info
const convertToResponseGamestate = (gameState) => {
    let nextQuestion;
    if (gameState.outcome == "ended") {
        nextQuestion = {question: "game over", answers: ["game over"]};
    } else {
        nextQuestion = gameState.questionBank[gameState.counter];
    }
    let playerResponseInfo = [];
    gameState.players.forEach(p => {
        let playerInfo = {
            nickname: p.nickname,
            score: p.score,
            alreadyAnswered: p.alreadyAnswered
        }
        playerResponseInfo.push(playerInfo);
    })
    let responseGameState = {
        playerInfos: playerResponseInfo,
        activeQuestion: {
            question: nextQuestion.question,
            answers: nextQuestion.answers
        },
        questionNumber: gameState.counter,
        outcome: gameState.outcome
    }
    return responseGameState;
}

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

//accepts a user answer and updates the gamestate accordingly with who answered
// and user score. Question is incremented when all players have posted their answer
const postSpecificGameHandler = async (req, res, next, { GameState }) => {
    // get the gamestate
    GameState.findOne({_id: req.params.gameid}).exec().then(gameState => {

        if (gameState == undefined) {
            return res.status(500).send("the trivia game wasn't found");
        }
        if (!req.get("Authorization")) {
            return res.status(401).send("unauthorized access");
        }
       
        let auth = req.get("Authorization").split(" ")[1];
        let currPlayer = gameState.players.filter(p => p.sessID == auth)[0];
        if (currPlayer) {
            let activeQuestion = gameState.questionBank[gameState.counter];
            if (currPlayer.alreadyAnswered) {
                return res.status(400).send("this player has already answered");
            }
            let answerIndex = Number(String((req.body.move)));
            if (typeof answerIndex != "number") {
                return res.status(400).send("answer must be a number");
            }
            if (answerIndex < 0 || answerIndex > activeQuestion.answers.length) {
                return res.status(400).send("answer must be a valid number represnting index of potential answer");
            }
            if (gameState.outcome == "ended") {
                return res.status(400).send("Unable to make move, game has already ended")
            }
            // correct
            if (activeQuestion.correctAnswer == activeQuestion.answers[answerIndex]) {
                    currPlayer.score++;
            } 
            currPlayer.alreadyAnswered = true; 
            
            // advance to next question
            if (gameState.players.every(player => player.alreadyAnswered)) {
                gameState.counter++;
                if (gameState.counter == gameState.questionBank.length) {
                    gameState.outcome = "ended"
                }
                gameState.players.forEach(player => player.alreadyAnswered = false);
            }

            gameState.save((err, updateGameState) => {
                if (err) {
                    return res.status(500).send("unable to update game in mongo")
                }
                let response = convertToResponseGamestate(updateGameState);
                //console.log("sending gamestate: " + response);
                return res.status(201).json(response);
            });
            
        } else {
            return res.status(401).send("unauthorized access")
        }
    })
}

//gets 10 easy multipule choice questions from opentdb
const fetchQuestions = async (res) => {
    try {
        const response = await fetch("https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple&encode=base64");
        let data = await response.json();
        let questions = processDataFromTriviaAPI(data.results, res);
        return questions
    } catch (err) {
        return res.status(500).send("internal server error, couldn't get questions for trivia 2");
    }
}

//converts data recieved from trivia API to appropriate schema structure
const processDataFromTriviaAPI = (json, res) => {
    let questionBank = [];
    if (json.length == 0) {
        res.status(500).send("Error getting messages.");
        return
    } else {
        json.forEach((q, i) => {
            question = {
                question: q.question,
                answers: ([...q.incorrect_answers].concat(q.correct_answer)),
                correctAnswer: q.correct_answer,
            }
            shuffle(question.answers)
            questionBank.push(question);
        });
    }
    return questionBank
}

module.exports = { postGameHandler, getSpecificGameHandler, postSpecificGameHandler };
