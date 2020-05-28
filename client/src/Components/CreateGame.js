import React, {Component} from 'react';

class CreateGame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nickname: ''
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({nickname: event.target.value});
    }

    render() {
        return(
            <div>
                <h1>Create a New Game!</h1>
                <form>
                    <label>
                        Nickname:
                        <input type="text" value={this.state.nickname} onChange={this.handleChange} /><br/>
                        <div>
                            <input type="radio" id="public" name="publicgame" value="public"></input>
                            <label for="public">Public</label>

                            <input type="radio" id="private" name="publicgame" value="private"></input>
                            <label for="private">Private</label>
                        </div>
                        <input type="submit" value="Create Game" />
                    </label>
                </form>
            </div>
        );
    }
}

export default CreateGame