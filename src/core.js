'use strict';

class Core {

    constructor() {
        this.field = undefined;
    }

    generate(n) {
        if (n < 5) {
            throw new Error("Size of field must be 5 x 5 minimum");
        }
        if (n > 100) {
            throw new Error("Size of field must be 100 x 100 maximum");
        }

        let field = new Array(n);
        for (let r = 0; r < n; r++) {
            let row = new Array(r);
            for (let c = 0; c < n; c++) {
                row[c] = Core.generateBall();
            }
            field[r] = row;
        }

        this.field = field;
    }

    getField() {
        return this.field;
    }

    setField(field) {
        this.field = field;
    }

    static generateBall() {
        return Math.floor(Math.random() * (4 - 1 + 1)) + 1;
    }

    /**
     * Vertical, Horizontal, Illegal
     */
    static detectSwapDirection(firstBallCoords, secondBallCoords) {

        function neighbours(pos1, pos2) {
            return (Math.abs(pos1 - pos2) == 1);
        }

        let {row: row1, col: col1} = firstBallCoords;
        let {row: row2, col: col2} = secondBallCoords;

        let direction;
        if (col1 === col2 && neighbours(row1, row2)) {
            direction = VERTICAL;
        } else if (row1 === row2 && neighbours(col1, col2)) {
            direction = HORIZONTAL;
        } else {
            direction = ILLEGAL;
        }

        return {direction: direction}
    }

    swap(fromBallCoords, toBallCoords) {
        this.checkField();

        console.log("Field");
        console.log(this.field);

        let direction = Core.detectSwapDirection(fromBallCoords, toBallCoords);

        console.log("Direction -> " + direction.direction);

        let fromBall = this.getBallByCoords(fromBallCoords);
        let toBall = this.getBallByCoords(toBallCoords);

        if (this.isVerticalDirection(direction)) {
            console.log("Vertical");
            console.log("Row number: " + toBallCoords.row);
            let ballsRow = this.getRow(toBallCoords.row);
            console.log("Balls row: " + ballsRow);

            ballsRow[toBallCoords.col] = fromBall;
            console.log("Balls row to verify: " + ballsRow);

            let {start: start, end: end} = this.verifyBallsLine(ballsRow);

        }


        console.log("From ball: " + fromBall + ", to ball: " + toBall);


    }

    isVerticalDirection(direction) {
        return direction.direction === VERTICAL;
    }

    isHorizontalDirection(direction) {
        return direction.direction === HORIZONTAL;
    }

    getBallByCoords(coords) {
        return this.field[coords.row][coords.col];
    }

    checkField() {
        console.log("Checking field...");

        if (this.field === undefined) {
            throw new Error("Generate field first");
        }
    }

    getRow(row) {
        return this.field[row];
    }

    verifyBallsLine(ballsLine) {
        let buffer = ballsLine[0];
        var start;
        var end;

        for (var i = 1; i < ballsLine.length; i++) {
            var current = ballsLine[i];

            if (buffer.includes(current)) {
                buffer.push(current);
                end = i;
            } else {
                if (buffer.length >= 3) {

                }
            }


        }
    }
}

const VERTICAL = 'vertical';
const HORIZONTAL = 'horizontal';
const ILLEGAL = 'illegal';

export default Core;
