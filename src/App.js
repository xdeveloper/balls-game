import React, {Component} from 'react';
import logo from './res/logo.svg';
import './css/App.css';
import {Core, ILLEGAL_TYPE} from './engine/Core.js';
import Grid from './Grid.js';
import {log} from './engine/helpers';
import {COLUMN_TYPE, ILLEGAL_DIRECTION, ROW_TYPE, UNCHANGED_TYPE} from "./engine/Core";

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
                alert("Illegal direction (diagonal, too far)!")
            } else if (moveResult.type === UNCHANGED_TYPE) {
                alert("Balls will not be interchanged!")
            } else {
                log("New field's state: ");
                alert(this.core.getField());

                alert("Hurray!");

                this.setState({field: this.core.getField()});

                alert("Hurray!2");

               /* if (moveResult.type === ROW_TYPE) {
                    this.core.refillWith({pos: moveResult.pos, type: ROW_TYPE});
                }

                if (moveResult.type === COLUMN_TYPE) {
                    this.core.refillWith({pos: moveResult.pos, type: COLUMN_TYPE});
                }

                this.setState({field: this.core.getField()});*/
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
