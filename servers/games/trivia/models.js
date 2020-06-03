const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answers: [{ answer: { type: String, required: true } }],
    correctAnswer: { type: String, required: true },
    counter: { type: Number, required: true }
})

const GameStateSchema = new mongoose.Schema({
    id: {type: String, required: true},
    players: [
        {
            sessID: { type: String, required: true },
            nickname: { type: String, required: true },
            score: { type: Number, required: true },
            alreadyAnswered: { type: Boolean, required: true }
        }
    ],
    activeQuestion: questionSchema,
    counter: { type: Number, required: true },
    questionBank: [questionSchema],
})

// GameStateSchema.methods.getQuizQuestionClientFormat = function (index) {
//     return GameState.find(req.params)
//         .then(res => {
//             return res.map(q => {
//                 const data = q.toObject();
//                 const answer = data.correct_answer;
//                 delete data.correct_answer;
//                 data.question_possibilities.push({ answer })
//                 data.question_possibilities = data.question_possibilities
//                     .map(d => ({ answer: d.answer }));
//                 shuffle(data.question_possibilities);
//                 return data;
//             })
//         });
// };


// models/questions.js
const GameState = mongoose.model('GameState', GameStateSchema);

module.exports = { GameState };


// function getQuizQuestions() {
//   return Question.find()
//     .then(res => {
//       return res.map(q => {
//         const data = q.toObject();
//         const answer = data.correct_answer;
//         delete data.correct_answer;
//         data.question_possibilities.push({answer})
//         data.question_possibilities = data.question_possibilities
//           .map(d => ({answer: d.answer}));
//         shuffle(data.question_possibilities);
//         return data;
//       })
//     });
// }



// function getCorrectAnswers() {
//   return Question.find()
//     .then(res => {
//       return res.reduce((agg, q) => {
//         agg[q._id] = q.correct_answer;
//         return agg;
//       }, {});
//     });
// }


// module.exports = {
//   Question,
//   getCorrectAnswers,
//   getQuizQuestions,
// }
// }


let responseGameState = {
    playerInfo = {
        nickname,
        score,
        alreadyAnswered
    },
    activeQuestion: {
        question,
        answers,
        counter
    },
    counter,
}



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







