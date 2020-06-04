const Schema = require('mongoose').Schema;

const questionType = {
    question: { type: String, required: true },
    answers: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    counter: { type: Number, required: true }
}

const playerType = {
    sessID: { type: String, required: true },
    nickname: { type: String, required: true },
    score: { type: Number, required: true },
    alreadyAnswered: { type: Boolean, required: true }
}

// const GameStateSchema = new Schema({
//     players: {type: [playerType], required: true},
//     activeQuestion: { type: questionType, required: true },
//     counter: { type: Number, required: true },
//     questionBank: { type: [questionType], required: true },
// });
// players: {type: [playerType], required: true},
const GameStateSchema = new Schema({
    counter: Number
});


module.exports = { GameStateSchema };
//gameHandler (creates gamestate)
    // calls trivia api and gets questions
    // uploads questions into custom schema on mongo
    // populates rest of game state....

    // specificHandler (Get)
        //send activequestion to client (question and potential key:answers (only strings))
        //send players
        //send counter
    //specificHandler (post)
        // url: lobbyID, header: auth, body: "key"







