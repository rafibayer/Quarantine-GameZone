import React, {Component} from 'react';

class CreateNickname extends Component {
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
                <form>
                    <label for="nickname">Nickname</label>
                    <input type="text" id="nickname" value={this.state.nickname} onChange={this.handleChange} />
                    <input type="submit" value="Submit" />
                </form>
            </div>

        );
    }
}

export default CreateNickname