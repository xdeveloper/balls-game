import React, {Component} from 'react';
import logo from './res/logo.svg';
import './App.css';
import Core from './Core.js';
import Grid from './Grid.js';
import {log} from './helpers';

class App extends Component {

    constructor() {
        super();

        let core = new Core();
        core.generate(5);

        this.state = {
            field: core.getField()
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

        let field = core.getField();
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

                <Grid field={this.state.field} />
            </div>
        );
    }
}

export default App;
