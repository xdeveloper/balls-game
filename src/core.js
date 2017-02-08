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

    // For unit testing
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
            let ballsRow = this.copyRow(toBallCoords.row);
            console.log("Balls row: " + ballsRow);
            ballsRow[toBallCoords.col] = fromBall;
            console.log("Balls row to verify: " + ballsRow);

            let refinedBallsRow = Core.refineBallsLine(ballsRow);


            console.log("From ball с: " + Core.serializeCoord(fromBallCoords) + ", to ball с: " + Core.serializeCoord(toBallCoords));
            console.log("From ball: " + this.getBallByCoords(fromBallCoords) + ", to ball: " + this.getBallByCoords(toBallCoords));

            this.swapBallsOnField(fromBallCoords, toBallCoords);

            this.field[toBallCoords.row] = refinedBallsRow;
        }

        console.log("From ball: " + fromBall + ", to ball: " + toBall);
    }

    static serializeCoord(coords) {
        return '{row: ' + coords.row + ' , col: ' + coords.col + '}';
    }

    swapBallsOnField(fromBallCoords, toBallCoords) {
        let fromBall = this.getBallByCoords(fromBallCoords);
        let toBall = this.getBallByCoords(toBallCoords);
        this.setBallByCoords(fromBallCoords, toBall);
        this.setBallByCoords(toBallCoords, fromBall);
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

    setBallByCoords(coords, ball) {
        this.field[coords.row][coords.col] = ball;
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

    copyRow(row) {
        return this.getRow(row).slice();
    }

    static refineBallsLine(ballsLine) {
        function isLongEnough(buffer) {
            return buffer.length >= 3;
        }

        function makeNewLineIfNeeded(buffer, ballsLine) {
            if (!isLongEnough(buffer)) {
                return ballsLine;
            } else {
                let newBallLine = ballsLine.slice();
                for (let i = start; i <= end; i++) {
                    newBallLine[i] = DELETED_BALL;
                }

                return newBallLine;
            }
        }

        let buffer = [ballsLine[0]];
        let start = 0;
        let end;

        for (var i = 1; i < ballsLine.length; i++) {
            let current = ballsLine[i];
            if (buffer.includes(current)) {
                buffer.push(current);
                end = i;
            } else {
                if (isLongEnough(buffer)) {
                    break;
                } else {
                    start = i;
                    buffer = [current];
                }
            }
        }

        return makeNewLineIfNeeded(buffer, ballsLine);
    }
}

const VERTICAL = 'vertical';
const HORIZONTAL = 'horizontal';
const ILLEGAL = 'illegal';
const DELETED_BALL = 0;

export default Core;
