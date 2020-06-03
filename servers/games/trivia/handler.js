const fetch = require("node-fetch");
const redis = require('redis');
const config = require('./config');
const http = require('http');

const postGameHandler = async (req, res, { GameState }) => {
    //first call on triviadb to get data
    let questions = await fetchQuestions(res);
    //console.log(questions);
    console.log(req.body);
    console.log(GameState)
    const { lobby_id, game_type, private, players, capacity, gameID } = req.body;

    let playersArr = [];
    players.forEach((p, i) => {
        let playerNickname = "test" + i; //GetNickname(p);
        player = {
            sessID: p,
            nickname: playerNickname,
            score: 0,
            alreadyAnswered: false

        };
        playersArr.push(player);
    });
    let counterStart = 0;

    const gameState = {
        id: gameID,
        players: playersArr,
        activeQuestion: questions[counterStart++],
        counter: counterStart,
        questionBank: questions
    }

    console.log("gameState: ", gameState)

    const saveGameState = new GameState(gameState);
    saveGameState.save((err, newGameState) => {
        if (err) {
            console.log(err)
            res.status(500).send('Unable to create a trivia game');
            return;
        }
        res.status(201).json(newGameState);
    })
}
//getSpecificGameHandler gets the gameID from url, and fetches the game state,
// parsing into a response that includes an active question, non-sensitive player info and counter
// it also makes sure to shuffle the answers for the active question
const getSpecificGameHandler = async (req, res, { GameState }) => {
    GameState.findOne({ id: req.params.gameid }).exec().then(gameState => {
        if (gameState == undefined) {
            throw new Error("Error getting mesages from Mongo: " + err.message);
        }
        let responseGameState = convertToResponseGamestate(gameState);
        if (responseGameState) {
            return res.status(200).json(responseGameState);
        }
    }).catch(err => {
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
            counter: counter
        },
        counter: gameState.counter
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

// const getNickName = async (playerSID) => {
//     const options = {
//         hostname: config.Endpoints.nickname[0],
//         port: config.Endpoints.nickname[1],
//         path: config.Endpoints.nickname[2],
//         headers: {
//             Authorization: "Bearer " + playerSID
//         },
//         method: 'GET'
//     }
//     const req = https.request(options, (res) => {
//         if (res.statusCode >= 400) {
//             return res.statusCode
//          }
//         console.log(`statusCode: ${res.statusCode}`)
//         res.on('data', (data) => {
//           return data;
//         })
//       })

//       req.on('error', (error) => {
//         return error;
//       })

//       req.end();

//       console.log(req);
// }


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
                counter: i
            }
            questionBank.push(question);
        });
    }
    return questionBank
}


module.exports = { postGameHandler, getSpecificGameHandler, postSpecificGameHandler };
