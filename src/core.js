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
    static detectMoveDirection(firstBallCoords, secondBallCoords) {
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

    makeMove(fromBallCoords, toBallCoords) {
        this.checkField();

        let direction = Core.detectMoveDirection(fromBallCoords, toBallCoords);

        if (this.isIllegalDirection(direction)) {
            console.log("Illegal Move Direction");
        } else if (this.isVerticalDirection(direction)) {
            let ballsRow = this.copyRow(toBallCoords.row);
            ballsRow[toBallCoords.col] = this.getBallByCoords(fromBallCoords);
            this.swapBallsOnField(fromBallCoords, toBallCoords);
            this.setRow(toBallCoords.row, Core.refineBallsLine(ballsRow));
        } else if (this.isHorizontalDirection(direction)) {
            let ballsColumn = this.copyColumn(toBallCoords.col);
            ballsColumn[toBallCoords.row] = this.getBallByCoords(fromBallCoords);
            this.swapBallsOnField(fromBallCoords, toBallCoords);
            this.setColumn(toBallCoords.col, Core.refineBallsLine(ballsColumn));
        }
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

    isIllegalDirection(direction) {
        return direction.direction === ILLEGAL;
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
        if (this.field === undefined) {
            throw new Error("Generate field first");
        }
    }

    getRow(row) {
        return this.field[row];
    }

    getColumn(col) {
        return this.field.map((row) => row[col]);
    }

    copyRow(row) {
        return this.getRow(row).slice();
    }

    copyColumn(col) {
        return this.getColumn(col).slice();
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

    setRow(row, balls) {
        this.field[row] = balls;
    }

    setColumn(col, balls) {
        if (this.field.length != balls.length) {
            return;
        }

        let i = 0;
        this.field.forEach((row) => row[col] = balls[i++]);
    }
}

const VERTICAL = 'vertical';
const HORIZONTAL = 'horizontal';
const ILLEGAL = 'illegal';
const DELETED_BALL = 0;

export default Core;