import React, {Component} from 'react';
import './css/Helpers.css';
import Ball from "./Ball";

const style = {
    normal: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        backgroundColor: 'lightgray'
    },
    important: {
        color: 'red',
        fontSize: 20,
        fontWeight: 'bold',
        backgroundColor: 'lightgray'
    }
};

class MessageBox extends Component {

    render() {
        return (
            <div style={this.props.important ? style.important : style.normal}>
                {this.props.message}
            </div>
        );
    }
}

export default MessageBox;