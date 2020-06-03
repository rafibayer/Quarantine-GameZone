const fetch = require("node-fetch");
const redis = require('redis');
const config = require('./config');
const http = require('http');

const postGameHandler = async (req, res, { GameState }) => {
    //first call on triviadb to get data
    let questions = await fetchQuestions(res);
    console.log(questions)

    const {ID, GameType, Private, Players, Capacity, GameID } = req.body.lobby;

    let playersArr = [];
    Players.forEach((p, i) => {
        playerNickname = "test" + i; //GetNickname(p);
        let player =
        {
            sessID: player.p,
            nickname: playerNickname,
            score: 0,
            alreadyAnswered: false

        };
        players.push(player);
    });
    let counterStart = 0;

    const gameState = {
        players: playersArr,
        activeQuestion: questions[counter++],
        counter: counterStart,
        questionBank: questions
    }

    const query = new GameState(gameState);
    query.save((err, newGameState) => {
        if (err) {
            console.log(err)
            res.status(500).send('Unable to create a trivia game');
            return;
        }
        res.status(201).json(newGameState);
    })
}

const getSpecificGameHandler = async (req, res, { GameState }) => {

    //use lobby in get response to get correct gamestate
    //send activequestion to client (question and potential key:answers (only strings))
    //send players
    //send counter

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
        const response = await fetch("https://opentdb.com/api.php?amount=5&category=27&difficulty=easy&type=multiple");
        let data = await response.json();
        let questions = processData(data.results);
        return questions
    } catch (err) {
        console.log(err);
        return res.status(500).send("internal server error, couldn't get questions for trivia 2");
    }
}
const processData = (json) => {
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
