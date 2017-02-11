import React, {Component} from 'react';
import logo from './res/logo.svg';
import './css/App.css';
import {Core, ILLEGAL_TYPE} from './engine/Core.js';
import Grid from './Grid.js';
import {log} from './engine/helpers';
import {ILLEGAL_THE_SAME_BALLS_TYPE, ROW_TYPE, UNCHANGED_TYPE} from "./engine/Core";
import MessageBox from "./MessageBox";
import ScoreBox from "./ScoreBox";

class App extends Component {

    constructor() {
        super();

        this.core = new Core();
        this.core.generate(5);
        this.selectedBallCoords = undefined;
        this.score = 0;
        this.field = this.core.getField();
        this.state = {
            message: 'Click 2 balls to swap',
            messageImportant: false,
            field: this.field,
            score: this.score
        }
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
                    }
                }, 300);
            }

            this.from = undefined;
        }

    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h2>React-based Balls Game</h2>
                </div>
                <br />
                <ScoreBox score={this.state.score}/>
                <hr />
                <MessageBox message={this.state.message} important={this.state.messageImportant}/>
                <br />
                <Grid
                    field={this.field}
                    howManyColours={this.core.getHowManyBallColours()}
                    ballSelected={(row, col) => this.selectedBall(row, col)}/>
            </div>
        );
    }
}

export default App;
