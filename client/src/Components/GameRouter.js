import React, {Component} from 'react';

class Game extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return(
            <div>
                {this.props.gameID}
            </div>

        );
    }
}

export default Game