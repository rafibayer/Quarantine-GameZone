import React, {Component} from 'react';
import api from '../Constants/Endpoints.js'
import Errors from './Errors.js'

class JoinGame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            public_games: {},
            error: ""
        }
    }

    setPublicGames = (games) => {
        this.setState({public_games: games})
    }

    // set error message
    setError = (error) => {
        this.setState({ error })
    }

    // gets recent public games for player to join
    getCurrentPlayer = async () => {
        const response = await fetch(api.testbase + api.handlers.games, {
            headers: new Headers({
                "X-User": this.props.playerSession
            })
        });
        if (response.status >= 300) {
            const error = await response.text();
            this.setError(error);
            return;
        }
        const games = await response.json();
        this.setPublicGames(games);
    }

    render() {
        // get public games to display
        let displayPublicGames = [];
        Object.values(this.state.public_games).forEach((game) => { ;
            displayPublicGames.push(<li>{game.game_type}</li>);
        });
        const { error } = this.state;
        return(
            <div>
                <Errors error={error} setError={this.setError} />
                <h1>Join a Public Game</h1>
                <ul>{displayPublicGames}</ul>
            </div>
        );
    }
}

export default JoinGame