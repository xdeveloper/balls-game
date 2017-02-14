import React, {Component} from 'react';

import deleted from './res/white.svg';
import red from './res/red.svg';
import green from './res/green.svg';
import blue from './res/blue.svg';
import black from './res/black.svg';
import purple from './res/yellow.svg';
import cyan from './res/cyan.svg';
import orange from './res/orange.svg';

class Ball extends Component {

    static mapBallToBallPicture(ball) {
        let pic;
        switch (ball) {
            case 0:
                pic = deleted;
                break;

            case 1:
                pic = red;
                break;
            case 2:
                pic = green;
                break;
            case 3:
                pic = blue;
                break;
            case 4:
                pic = black;
                break;
            case 5:
                pic = purple;
                break;
            case 6:
                pic = cyan;
                break;
            case 7:
                pic = orange;
                break;
            default:
                throw new Error("Can't map ball to ball picture. Supported 7");
        }
        return pic;
    }

    render() {
        return (
            <img
                onClick={() => {
                    this.props.clickFn(this.props.row, this.props.column)
                }}
                src={Ball.mapBallToBallPicture(this.props.ball)}
                alt="[X]"
                title={"Select Ball " + this.props.ball}
                className="Ball"/>
        );
    }
}

export default Ball;