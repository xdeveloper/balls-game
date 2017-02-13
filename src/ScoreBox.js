import React, {Component} from 'react';
import './css/Helpers.css';

class ScoreBox extends Component {
    render() {
        return (
            <div className="App-ScoreBox">Score {this.props.score}</div>
        );
    }
}

export default ScoreBox;