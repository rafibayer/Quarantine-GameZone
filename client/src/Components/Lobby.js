import React, {Component} from 'react';
import CreateGame from './CreateGame.js'
import JoinGame from './JoinGame.js'

class Lobby extends Component {

    render() {
        return(
            <div>
                <CreateGame></CreateGame>
                <JoinGame></JoinGame>
            </div>

        );
    }
}

export default Lobby