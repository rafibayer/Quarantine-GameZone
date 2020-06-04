const fetch = require("node-fetch");
const redis = require('redis');
const config = require('./config');
const http = require('http');
const axios = require("axios")

const loop = async (players) => {
    playersArr = Promise.all(players.map(async (p, i) => {
        const options = {
            headers: {
                Authorization: "Bearer " + p
            },
        }
        try {
            const resp = await axios.get("http://gamezone_gateway:80/v1/sessions/mine", options)
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

const postGameHandler = async (req, res, next, { GameState }) => {
    let questions = await fetchQuestions(res);
    const { lobby_id, game_type, private, players, capacity, gameID } = req.body;
    let playersArr = await loop(players);
    const gameState = {
        players: playersArr,
        activeQuestion: questions[0],
        counter: 0,
        questionBank: questions
    }
    const saveGameState = new GameState(gameState);
    saveGameState.save((err, newGameState) => {
        if (err) {
            console.log(err)
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
    console.log("gameID: (" + req.params.gameid + ")");
    GameState.findOne({ _id: req.params.gameid }).exec().then(gameState => {
        if (gameState == undefined) {
            throw new Error("Error getting games from Mongo: " + err.message);
        }
        if (!req.get("Authorization")) {
            return res.status(401).send("unauthorized access")
        }
        let auth = req.get("Authorization").split(" ")[1]
        if (gameState.players.some(p => p.sessID == auth))
            console.log(gameState)
        let responseGameState = convertToResponseGamestate(gameState);
        if (responseGameState) {
            console.log(responseGameState);
            return res.status(200).json(responseGameState);
        }
    }).catch(err => {
        console.log("error message inside catch: ", err);
        return res.status(404).send("couldn't find trivia game");
    })
}

//method converst the gamestate into a respone json for client,
//  includes active question with no answer and non-sensitive player info
const convertToResponseGamestate = (gameState) => {
    // get next active question, and shuffle answers
    let activeQuestion = gameState.questionBank[gameState.counter++];
    shuffle(activeQuestion.answers);
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
            question: activeQuestion.question,
            answers: activeQuestion.answers,
        },
        questionNumber: gameState.counter
    }
    return responseGameState;
}

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const postSpecificGameHandler = async (Req, res, { GameState }) => {

}

const fetchQuestions = async (res) => {
    try {
        const response = await fetch("https://opentdb.com/api.php?amount=10&category=27&difficulty=easy&type=multiple");
        let data = await response.json();
        let questions = processDataFromTriviaAPI(data.results);
        return questions
    } catch (err) {
        console.log(err);
        return res.status(500).send("internal server error, couldn't get questions for trivia 2");
    }
}

//converts data recieved from trivia API to appropriate schema structure
const processDataFromTriviaAPI = (json) => {
    let questionBank = [];
    if (json.length == 0) {
        res.status(500).send("Error getting messages.");
        return
    } else {
        json.forEach((q, i) => {
            question = {
                question: q.question,
                answers: [...q.incorrect_answers].concat(q.correct_answer),
                correctAnswer: q.correct_answer,
            }
            questionBank.push(question);
        });
    }
    return questionBank
}


module.exports = { postGameHandler, getSpecificGameHandler, postSpecificGameHandler };
// try {
//     const states = await GameState.find();
//     // filter private channels we aren't members of
//     const result = states.filter((gamestate) => gamestate);
//     console.log(result)
//     res.status(200).json(result);
//     return
// } catch (e) {
//     res.status(500).send("There was an internal error getting channels");
// }