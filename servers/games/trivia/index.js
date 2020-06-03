const mongoose = require("mongoose");
const express = require("express");
const config = require('./config');
const http = require('http');

const gameStateSchema = require('./models');
const { postGameHandler, getSpecificGameHandler } = require('./handler');

const mongoEndpoint = "mongodb://gamezone_mongo:27017/trivia"
const port = 4000;
const app = express();
app.use(express.json());

const GameState = mongoose.model('GameState', gameStateSchema);

const connectWithRetry = () => {
    console.log('MongoDB connection with retry');
    mongoose.connect(mongoEndpoint).then(() => {
        console.log('MongoDB is connected');
    }).catch(err => {
        console.log('MongoDB connection unsuccessful, retry after 3 seconds.')
        setTimeout(connectWithRetry, 3000);
    });
}

const RequestWrapper = (handler, SchemeAndDbForwarder) => {
    return (req, res, next) => {
        handler(req, res, next, SchemeAndDbForwarder);
    }
}

var listener = app.listen(4000, function () {
    console.log('Listening on port ' + listener.address().port); //Listening on port 8888
});
//const GameState = mongoose.model('GameState', GameStateSchema);
app.use((err, req, res, next) => {
    console.error(err) // log the err to the console (serverside only)

    res.set("Content-Type", "text/plain")
    res.status(500).send("Server experienced an error")
})

app.post("/v1/trivia", RequestWrapper(postGameHandler, { GameState }));
app.get("/v1/trivia/:gameid", RequestWrapper(getSpecificGameHandler, { GameState }));



connectWithRetry();
mongoose.connection.on('error', console.error)
    .on('disconnected', connectWithRetry)
    .once('open', main);

async function main() {
}


