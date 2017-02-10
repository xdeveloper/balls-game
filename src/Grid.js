import React, {Component} from 'react';

import red from './res/red.svg';
import green from './res/green.svg';
import blue from './res/blue.svg';
import black from './res/black.svg';
import purple from './res/yellow.svg';

const styles = {
    container: {
        border: 1,
        backgroundColor: 'yellow',
        background: 'white'
    }
};

class Grid extends Component {

    constructor() {
        super();
    }

    mapBallToBallPicture(ball) {
        let pic;
        switch (ball) {
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
            default:
                throw new Error("Can't map ball to ball picture");
        }
        return pic;
    }

    render() {
        let field = this.props.field;

        let rowsCounter = 0;

        let fld = field.map((row) => {

            let colsCounter = 0;
            let cols = row.map(ball => {

                let xml = <div key={colsCounter}>
                    <img src={this.mapBallToBallPicture(ball)} className="App-logo" alt="logo"/>
                </div>;
                colsCounter++;
                return xml;
            });

            return <div style={{float: 'left'}} key={rowsCounter++}>{cols}</div>;
        });


        return (
            <div style={styles.container}>{fld}</div>
        );
    }
}

export default Grid;