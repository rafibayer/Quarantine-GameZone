import React, {Component} from 'react';
import CreateNickname from './Components/CreateNickname.js'
import Lobby from './Components/Lobby.js'
//import PageTypes from './Constants/PageTypes.js'
import api from './Constants/Endpoints.js';

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      //page: localStorage.getItem("Authorization") ? PageTypes.gameLobby : PageTypes.createNickname,
      authToken: localStorage.getItem("Authorization") || null,
      player: null
    };
    this.getCurrentPlayer();
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value});
  }

  getCurrentPlayer = async () => {
    if (!this.state.authToken) {
      return;
    }
    const response = await fetch(api.testbase + api.handlers.myplayer, {
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
    const player = await response.json()
    this.setPlayer(player);
  }

  /**
   * @description sets auth token
   */
  setAuthToken = (authToken) => {
    //this.setState({ authToken, page: authToken === "" ? PageTypes.createNickname : PageTypes.gameLobby });
    this.setState(authToken);
  }

  /**
   * @description sets the players
   */
  setPlayer = (player) => {
      this.setState({ player });
  }

  render() {
    const { player } = this.state;
    return (
      <div>
        {player ?  <Lobby /> : <CreateNickname />}
      </div>
    );
    
  }
}

export default App;
