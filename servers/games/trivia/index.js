const mongoose = require("mongoose");
const express = require("express");
const config = require('./config');
const http = require('http');

const { GameState } = require('./models');
const { postGameHandler, getSpecificGameHandler } = require('./handler');

const mongoEndpoint = "mongodb://localhost:27017/trivia"
const port = 4000;
const app = express();
app.use(express.json());

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

app.post("/v1/trivia", RequestWrapper(postGameHandler, { GameState }));
app.get("/v1/trivia/:gameid", RequestWrapper(getSpecificGameHandler, { GameState }));



connectWithRetry();
// mongoose.connection.on('error', console.error)
//     .on('disconnected', connectWithRetry)
//     .once('open', main);

// async function main() {
//     const options = {
//         hostname: 'gamezone_gateway', // config.Endpoints.nickname[0],
//         port: 80, //config.Endpoints.nickname[1],
//         path:  '/v1/sessions/mine', //config.Endpoints.nickname[2],
//         headers: {
//             Authorization: "Bearer " + "eDAJ87zSePz971D2xb70N6C2JmCtlwvzGZHH01FbjpYRA9oOHHc5Q6p60jCb079pPP8iTBLJL3kHb6Fe-iYecQ=="
//         },
//         method: 'GET'
//     }
//     const req = http.request(options, (res) => {
//         if (res.statusCode >= 400) {
//             return res.statusCode
//          }
//         console.log(`statusCode: ${res.statusCode}`)
//         res.on('data', (data) => {
//             console.log(data)
//           return data;
//         })
//       })
      
//       req.on('error', (error) => {
//         return error;
//       })
      
//       req.end();

//       console.log(req);
// }


