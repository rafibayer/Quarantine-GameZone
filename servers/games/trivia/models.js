const Schema = require('mongoose').Schema;
const questionType = {
    question: { type: String, required: true },
    answers: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
}
const playerType = {
    sessID: { type: String, required: true },
    nickname: { type: String, required: true },
    score: { type: Number, required: true },
    alreadyAnswered: { type: Boolean, required: true }
}
const gameStateSchema = new Schema({
    players: {type: [playerType], required: true},
    counter: { type: Number, required: true },
    questionBank: { type: [questionType], required: true },
});

module.exports = { gameStateSchema };