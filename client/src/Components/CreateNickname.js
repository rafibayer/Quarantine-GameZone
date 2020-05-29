import React, {Component} from 'react';
import api from '../Constants/Endpoints.js';
import Errors from './Errors.js';

class CreateNickname extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nickname: "",
            error: ""
        };
    }

    // sets nickname on change
    handleChange = (e) => {
        this.setState({nickname: e.target.value});
    }

    // set error message
    setError = (error) => {
        this.setState({ error })
    }

    // submit nickname form
    submitForm = async (e) => {
        e.preventDefault();
        const response = await fetch(api.testbase + api.handlers.players, {
            method: "POST",
            body: this.state.nickname,
            headers: new Headers({
                "Content-Type": "text/plain"
            })
        });
        if (response.status >= 300) {
            const error = await response.text();
            this.setError(error);
            return;
        }
        const authToken = response.headers.get("Authorization")
        localStorage.setItem("Authorization", authToken);
        this.setError("");
        this.props.setAuthToken(authToken);
        const player = await response.text();
        this.props.setPlayer(player);
    }


    render() {
        const { error } = this.state;
        return(
            <div>
                <Errors error={error} setError={this.setError} />
                <form>
                    <label for="nickname">Nickname</label>
                    <input type="text" id="nickname" value={this.state.nickname} onChange={this.handleChange} />
                    <input type="submit" value="Submit" onClick={this.submitForm} />
                </form>
            </div>

        );
    }
}

export default CreateNickname