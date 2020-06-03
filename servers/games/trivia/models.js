const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const questionSchema = new Schema({
//     question: { type: String, required: true },
//     answers: [{ answer: { type: String, required: true } }],
//     correctAnswer: { type: String, required: true },
//     counter: { type: Number, required: true }
// });

const GameStateSchema = new Schema({
    id: { type: String, required: true },
    players: [
        {
            sessID: { type: String, required: true },
            nickname: { type: String, required: true },
            score: { type: Number, required: true },
            alreadyAnswered: { type: Boolean, required: true }
        }
    ],
    activeQuestion: {
        question: { type: String, required: true },
        answers: [{ answer: { type: String, required: true } }],
        correctAnswer: { type: String, required: true },
        counter: { type: Number, required: true }
    },
    counter: { type: Number, required: true },
    questionBank: [{
        question: { type: String, required: true },
        answers: [{ answer: { type: String, required: true } }],
        correctAnswer: { type: String, required: true },
        counter: { type: Number, required: true }
    }],
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







