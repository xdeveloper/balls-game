import React, {Component} from 'react';
import logo from './res/logo.svg';
import './css/App.css';
import {Core, ILLEGAL_TYPE, HORIZONTAL_DIRECTION} from './engine/Core.js';
import Grid from './Grid.js';
import {log} from './engine/helpers';

class App extends Component {

    constructor() {
        super();

        this.core = new Core();
        this.core.generate(5);

        this.selectedBallCoords = undefined;

        this.state = {
            field: this.core.getField()
        }

    }

    start() {
        let core = new Core([
            [1, 2, 3, 4, 5],
            [5, 1, 2, 3, 4],
            [4, 5, 1, 2, 3],
            [3, 5, 5, 5, 2],
            [1, 3, 4, 5, 1],
        ]);

        core.scan(function (score) {
            log(score);
        });
    }

    start1() {
        let core = new Core([
            [1, 2, 3, 4, 5],
            [5, 1, 2, 3, 4],
            [4, 5, 1, 2, 3],
            [3, 0, 0, 0, 2],
            [1, 3, 4, 5, 1],
        ]);
        core.refillWith({pos: 3, type: 'row'}, 8);
    }

    selectedBall(row, col) {
        log("Clicked ball " + row + ',' + col);

        if (this.from === undefined) {
            this.from = {row, col};
        } else {
            log("Make move");

            let moveResult = this.core.makeMove(
                {row: this.from.row, col: this.from.col},
                {row: row, col: col});

            if (moveResult.type === ILLEGAL_TYPE) {
                alert("Illegal move!")
            }

            this.from = undefined;
        }

    }


    render() {

        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h2>Welcome to React</h2>
                </div>
                <p className="App-intro">
                    To get started, edit <code>src/App.js</code> and save to reload.
                </p>

                <button onClick={() => this.start()}>Oloo</button>
                <button onClick={() => this.start1()}>Oloo2</button>

                <Grid
                    field={this.state.field}
                    howManyColours={this.core.getHowManyBallColours()}
                    ballSelected={(row, col) => this.selectedBall(row, col)}
                />

            </div>
        );
    }
}

export default App;
