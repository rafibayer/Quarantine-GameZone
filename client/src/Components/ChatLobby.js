import React, {Component} from 'react';

class ChatLobby extends Component {
  constructor(props) {
    super(props);
    this.ws = new WebSocket("ws://api.rafibayer.me:443/ws?auth=" + localStorage.getItem("Authorization")) //CHANGE URL
    this.ws.onmessage = (e) => this.handleWs(e)
    this.state = {
      message: "",
      messages: []
    };
  }

  handleWs = (e) => {
    const messages = [...this.state.messages]; // creates shallow copy so it doesnt modify state directly
    messages.push(e.data);
    this.setState({messages: messages})
  }

  handleChange = (e) => {
    this.setState({message: e.target.value});
  }

  handleChat = (e) => {
    e.preventDefault();
    this.ws.send(this.state.message);
    this.setState({message: ""});
  }

  render() {
    return(
      <div>
        <input type="text" id="chatInput" value={this.state.message} onChange={this.handleChange} />
        <button type="submit" id="chatButton" onClick={this.handleChat}>Chat</button>
        <div id="chat">{this.state.messages.map(message => <p>{message}</p>)}</div>
      </div>
    );
  }
}

export default ChatLobby