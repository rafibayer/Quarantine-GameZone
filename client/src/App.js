import React, {Component} from 'react';
import CreateNickname from './Components/CreateNickname.js'
import Lobby from './Components/Lobby.js'
import api from './Constants/Endpoints.js';

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      authToken: localStorage.getItem("Authorization") || "",
      player: null
    };
   this.getCurrentPlayer();
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value});
  }

  // gets current player session from authorization header
  getCurrentPlayer = async () => {
    if (!this.state.authToken) {
      return;
    }
    const response = await fetch(api.testbase + api.handlers.player, {
      headers: new Headers({
          "Authorization": this.state.authToken
      })
    });
    if (response.status >= 300) {
        alert("Unable to get player session, bringing back to nickname creation.");
        localStorage.setItem("Authorization", "");
        this.setAuthToken("");
        this.setPlayer(null)
        return;
    }
    const player = await response.text()
    this.setPlayer(player);
  }
 
  // set auth token
  setAuthToken = (authToken) => {
    this.setState({ authToken });
  }

  // sets player
  setPlayer = (player) => {
      this.setState({ player });
  }

  render() {
    const { player } = this.state;
    return (
      // return either create nickname page or lobby page depending if they have created a player session
      <div>
        {player ?  <Lobby playerSession={this.state.authToken} playerNickname={player} setAuthToken={this.setAuthToken} setPlayer={this.setPlayer} /> : <CreateNickname setAuthToken={this.setAuthToken} setPlayer={this.setPlayer} />}
      </div>
    );
    
  }
}

export default App;
