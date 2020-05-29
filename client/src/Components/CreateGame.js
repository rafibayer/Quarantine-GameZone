import React, {Component} from 'react';

class CreateGame extends Component {

    render() {
        return(
            <div>
                <h1>Create a New Game</h1>
                <form>
                    <div>
                        <input type="radio" id="public" name="publicgame" value="public"></input>
                        <label for="public">Public</label>

                        <input type="radio" id="private" name="publicgame" value="private"></input>
                        <label for="private">Private</label>
                    </div>
                    <input type="submit" value="Create Game" />
                </form>
            </div>
        );
    }
}

export default CreateGame