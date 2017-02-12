import React, {Component} from 'react';
import './css/Helpers.css';
import Ball from "./Ball";

class ScoreBox extends Component {
    render() {
        return (
            <div className="App-ScoreBox">Score {this.props.score}</div>
        );
    }
}

export default ScoreBox;