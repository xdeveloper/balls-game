import React, {Component} from 'react';
import logo_game from './res/logo-game.jpg';
import './css/App.css';
import {Core, ILLEGAL_TYPE} from './engine/Core.js';
import Grid from './Grid.js';
import {log} from './engine/helpers';
import {ILLEGAL_THE_SAME_BALLS_TYPE, UNCHANGED_TYPE} from "./engine/Core";
import MessageBox from "./MessageBox";
import ScoreBox from "./ScoreBox";

class App extends Component {
    constructor() {
        super();

        this.core = new Core();
        this.initialize();
        this.handleUserNameChange = this.handleUserNameChange.bind(this);
    }

    initialize() {
        this.core.generate(5);
        this.selectedBallCoords = undefined;
        this.score = 0;
        this.field = this.core.getField();

        this.initialState = {
            playerName: 'Player1',
            gameOver: false,
            message: 'Click 2 balls to swap',
            messageImportant: false,
            field: this.field,
            score: this.score
        };

        this.state = this.initialState;
    }

    showMessage(message, messageImportant = false) {
        this.setState({message: message, messageImportant: messageImportant});
    }

    scoreCallback(score) {
        log("New score! " + score);
        this.score += score;
        this.setState({score: this.score});
        this.setState({field: this.core.getField()});

        // TODO!
        if (this.score > 200) {
            return true;
        }
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
                this.showMessage("Balls will not be interchanged!", true);
            } else if (moveResult.type === ILLEGAL_THE_SAME_BALLS_TYPE) {
                this.showMessage("You' re trying to swap ball with the same colour", true);
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
        // do save (server) ... todo

        // in case of OK - start again todo

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


        var top_10_players = 'Fill this ...';

        let gameOverArea = <div>
            Top 10 players:
            {top_10_players}
            <hr />
            Your name, please

            <input type="text" value={this.state.playerName} onChange={this.handleUserNameChange}/>

            <br />
            <br />
            <button onClick={() => this.saveAndStartAgain()}>Save and start again</button>
        </div>;

        let gameArea = this.state.gameOver ? gameOverArea : mainArea;


        return (
            <div className="App" style={{width: '100%'}}>
                <div className="App-header">
                    <img src={logo_game} className="App-logo-static" alt="logo"/>
                    <h2>React-based Balls Game</h2>
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
