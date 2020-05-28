import React, {Component} from 'react';
import CreateGame from './Components/CreateGame.js'
import JoinGame from './Components/JoinGame.js'
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <h1>Quarantine GameZone</h1>
        <CreateGame></CreateGame>
        <JoinGame></JoinGame>
      </div>
    );
  }
}

export default App;
