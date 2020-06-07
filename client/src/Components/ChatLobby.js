import React, {Component} from 'react';
import '../Styles/ChatLobby.css';

class ChatLobby extends Component {
  constructor(props) {
    super(props);
    this.ws = new WebSocket("wss://api.rafibayer.me:443/ws?auth=" + localStorage.getItem("Authorization"))
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
      <div id="chat-outer">
        <h1>Chat</h1>
        <div id="chatbar">
          <input type="text" id="chatInput" value={this.state.message} onChange={this.handleChange} />
          <button type="submit" id="chatButton" onClick={this.handleChat}>Chat</button>
        </div>
        <div id="chat">{this.state.messages.map(message => <p><strong>{message.split(":")[0]}:</strong>{message.split(":")[1]}</p>)}</div>
      </div>
    );
  }
}

export default ChatLobby