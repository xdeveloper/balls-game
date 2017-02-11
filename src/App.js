import React, {Component} from 'react';
import logo_game from './res/logo-game.jpg';
import './css/App.css';
import {Core, ILLEGAL_TYPE} from './engine/Core.js';
import Grid from './Grid.js';
import {log} from './engine/helpers';
import {ILLEGAL_THE_SAME_BALLS_TYPE, UNCHANGED_TYPE} from "./engine/Core";
import MessageBox from "./MessageBox";
import ScoreBox from "./ScoreBox";

// Replace with something else
// GET, POST
const SAVE_USER_SCORE_ENDPOINT = 'http://cors.io/?http://localhost:8080/score';

class App extends Component {
    constructor() {
        super();

        this.core = new Core();
        this.initialize();
        this.handleUserNameChange = this.handleUserNameChange.bind(this);
    }

    initialize() {
        this.generateField();
        this.field = this.core.getField();

        this.initialState = {
            playerName: 'Player1',
            gameOver: false,
            message: 'Click 2 balls to swap',
            messageImportant: false,
            field: this.field,
            score: 0
        };

        this.state = this.initialState;
    }

    generateField() {
        this.core.generate(5);
    }

    showMessage(message, messageImportant = false) {
        this.setState({message: message, messageImportant: messageImportant});
    }

    scoreCallback(score) {
        log("New score! " + score);
        this.setState({score: this.state.score += score, field: this.core.getField()});
    }

    updateFieldCallback() {
        this.setState({field: this.core.getField()});
    }

    deferredCall(fn, timeout = 0) {
        setTimeout(fn.bind(this), timeout);
    }

    selectedBall(row, col) {
        log("Clicked ball row - " + row + ', col - ' + col);

        if (this.from === undefined) {
            this.showMessage('Ok. First one has been selected');
            this.from = {row, col};
        } else {
            log("Try move");

            let moveResult = this.core.tryMove({row: this.from.row, col: this.from.col}, {row: row, col: col});

            if (moveResult.type === ILLEGAL_TYPE) {
                this.showMessage("Illegal direction (diagonal move or balls are too far from each other)!", true);
            } else if (moveResult.type === UNCHANGED_TYPE) {
                this.showMessage("Balls will not swap", true);
            } else if (moveResult.type === ILLEGAL_THE_SAME_BALLS_TYPE) {
                this.showMessage("You' re trying to swap balls with the same colours", true);
            } else {
                this.showMessage("Correct move!");
                this.deferredCall(() => {
                    this.showMessage("Calculating score");
                    this.core.scan(this.scoreCallback.bind(this), this.updateFieldCallback.bind(this));

                    if (this.core.canMakeNextMove()) {
                        this.showMessage("Make your move", true);
                    } else {
                        this.showMessage("Game over!", true);
                        this.setState({gameOver: true});
                    }
                }, 300);
            }

            this.from = undefined;
        }

    }

    saveAndStartAgain() {
        log(this.state.score);
        log(this.state.playerName);

        // Save to server
        let xhr = new XMLHttpRequest();
        let body = 'playerName=' + this.state.playerName + '&score=' + this.state.score;
        xhr.open("POST", SAVE_USER_SCORE_ENDPOINT, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        let onloadFn = function (e) {
            this.showMessage('Saved');
        };
        let onerrorFn = function (e) {
            this.showMessage('Error saving to server', true);
        };
        xhr.onload = onloadFn.bind(this);
        xhr.onerror = onerrorFn.bind(this);
        xhr.send(body);

        this.resetGame();
    }

    startAgain() {
        this.showMessage('Game restarted without saving');
        this.resetGame();
    }

    resetGame() {
        this.generateField();
        this.setState(this.initialState);
    }

    handleUserNameChange(event) {
        this.setState({playerName: event.target.value});
    }

    render() {
        let mainArea = <div>
            <br />
            <center>
                <Grid
                    field={this.field}
                    howManyColours={this.core.getHowManyBallColours()}
                    ballSelected={(row, col) => this.selectedBall(row, col)}/>
            </center>
        </div>;

        let top_10_players = 'Fill this ...';

        let gameOverArea = <div>
            Top 10 players:
            {top_10_players}
            <hr />
            Your name, please <input type="text" value={this.state.playerName} onChange={this.handleUserNameChange}/>
            <br />
            <br />
            <button onClick={() => this.saveAndStartAgain()}>Save and start again</button>
            <button onClick={() => this.startAgain()}>Just start again</button>
        </div>;

        let gameArea = this.state.gameOver ? gameOverArea : mainArea;

        return (
            <div className="App" style={{width: '100%'}}>
                <div className="App-header">
                    <img src={logo_game} className="App-logo-static" alt="logo"/>
                    <h2>Balls Game (featured by React)</h2>
                </div>
                <br />
                <ScoreBox score={this.state.score}/>
                <MessageBox message={this.state.message} important={this.state.messageImportant}/>
                <br />
                {gameArea}
            </div>
        );
    }
}

export default App;