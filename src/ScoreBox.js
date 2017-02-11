import React, {Component} from 'react';
import './css/Helpers.css';
import Ball from "./Ball";

const style = {
    container: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
        backgroundColor: 'lightblue'
    }
};

class ScoreBox extends Component {
    render() {
        return (
            <div style={style.container}>{this.props.score}</div>
        );
    }
}

export default ScoreBox;