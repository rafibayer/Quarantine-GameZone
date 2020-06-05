import React, {Component} from 'react';
import CreateNickname from './Components/CreateNickname.js'
import MainLobby from './Components/MainLobby.js'
import Errors from './Components/Errors.js'
import api from './Constants/Endpoints.js';
import './Styles/App.css';

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      authToken: localStorage.getItem("Authorization") || "",
      player: null,
      error: ""
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
        localStorage.setItem("GameLobby", null);
        this.setAuthToken("");
        this.setPlayer(null);
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

  // set error message
  setError = (error) => {
    this.setState({ error })
  }

  render() {
    const { player, error } = this.state;
    return(
      <div>
        <Errors error={error} setError={this.setError} />
        {player ?
          <MainLobby player={player} setAuthToken={this.setAuthToken} setPlayer={this.setPlayer} /> 
          : 
          <CreateNickname setAuthToken={this.setAuthToken} setPlayer={this.setPlayer} />
        }
      </div>
    );
  }
}

export default App;
