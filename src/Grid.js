import React, {Component} from 'react';
import './css/Helpers.css';
import Ball from "./Ball";

class Grid extends Component {

    render() {
        let rowIndex = 0;
        let tableRows = this.props.field.map((row) => {
            let colIndex = 0;
            let cols = row.map(ball => {
                let rowElements = <div key={colIndex} className="divTableCell">
                    <Ball ball={ball} row={rowIndex} column={colIndex} clickFn={this.props.ballSelected}/>
                </div>;
                colIndex++;
                return rowElements;
            });

            return <div key={rowIndex++} className="divTableRow">{cols}</div>
        });

        return (
            <div className="divTable">
                <div className="divTableBody">
                    {tableRows}
                </div>
            </div>
        );
    }
}

export default Grid;