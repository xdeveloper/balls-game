import React, {Component} from 'react';
import './css/Helpers.css';

const style = {
    normal: {
        color: 'gray',
        fontSize: 20,
        fontWeight: 'bold',
    },
    important: {
        color: 'red',
        fontSize: 20,
        fontWeight: 'bold',
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