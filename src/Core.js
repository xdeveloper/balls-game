import {log, stop} from './helpers';
import {range} from 'lodash';

const VERTICAL = 'vertical';
const HORIZONTAL = 'horizontal';
const ILLEGAL = 'illegal';
const DELETED_BALL = 0;
const ROW_TYPE = 'row';
const COLUMN_TYPE = 'column';
const ILLEGAL_TYPE = 'illegal';
const UNCHANGED_TYPE = 'unchanged';
const SCORE_PER_BALL = 10;
const HOW_MANY_BALL_COLOURS = 5;

class Core {

    // For unit testing
    constructor(field) {
        this.field = field;
    }

    /**
     * Generates the field of n x n size
     * @param n size of field
     */
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
        return Math.floor(Math.random() * (HOW_MANY_BALL_COLOURS - 1 + 1)) + 1;
    }

    static detectMoveDirection(firstBallCoords, secondBallCoords) {
        function neighbours(pos1, pos2) {
            return (Math.abs(pos1 - pos2) === 1);
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

        let result = {pos: 0, type: UNCHANGED_TYPE};

        if (Core.isIllegalDirection(direction)) {
            console.log("Illegal Move Direction");
            result = {pos: 0, type: ILLEGAL_TYPE};
        } else if (Core.isVerticalDirection(direction)) {
            let ballsRow = this.copyRow(toBallCoords.row);
            ballsRow[toBallCoords.col] = this.getBallByCoords(fromBallCoords);
            this.swapBallsOnField(fromBallCoords, toBallCoords);
            let refined = Core.refineBallsLine(ballsRow);
            if (Core.containsDeletedBalls(refined)) {
                this.setRow(toBallCoords.row, refined);
                result = {pos: toBallCoords.row, type: ROW_TYPE};
            }
        } else if (Core.isHorizontalDirection(direction)) {
            let ballsColumn = this.copyColumn(toBallCoords.col);
            ballsColumn[toBallCoords.row] = this.getBallByCoords(fromBallCoords);
            this.swapBallsOnField(fromBallCoords, toBallCoords);
            let refined = Core.refineBallsLine(ballsColumn);
            if (Core.containsDeletedBalls(refined)) {
                this.setColumn(toBallCoords.col, refined);
                result = {pos: toBallCoords.col, type: COLUMN_TYPE};
            }
        }

        return result;
    }

    /**
     *
     * @param coords
     * @param value used in unit tests only, do not pass it in real code
     */
    refillWith(coords, value) {
        let {pos, type} = coords;

        if (type === ROW_TYPE) {
            let deletedBallsPos = Core.deletedBallsPos(this.getRow(pos));
            this._refillArea(deletedBallsPos.start, deletedBallsPos.end, pos, value);
        }
        if (type === COLUMN_TYPE) {
            this._refillColumn(pos, value);
        }
    }

    _refillColumn(pos, value) {
        let column = this.getColumn(pos);
        let survivors = column.filter((ball) => ball !== DELETED_BALL);
        let newBallsLine = Core.generateBalls(column.length - survivors.length, value).concat(survivors);
        this.setColumn(pos, newBallsLine);
    }

    // private method
    _refillArea(start, end, row, value) {
        function modifyRow(dest, src, start, end) {
            for (let i = start; i !== end + 1; i++) {
                dest[i] = src[i];
            }
        }

        function modifyLastRow(dest, src, start, end) {
            let c = 0;
            for (let i = start; i !== end + 1; i++) {
                dest[i] = src[c++];
            }
        }

        for (let i = row; i > 0; i--) {
            modifyRow(this.getRow(i), this.getRow(i - 1), start, end);
        }

        let newlyGeneratedBalls = Core.generateBalls(end - start + 1, value);
        modifyLastRow(this.getRow(0), newlyGeneratedBalls, start, end);
    }

    static generateBalls(howManyBalls, ball) {
        let generator = ball === undefined ? Core.generateBall : () => ball;
        return range(howManyBalls).map(generator);
    }

    static deletedBallsPos(ballsLine) {
        let result;
        for (let i = 0; i < ballsLine.length; i++) {
            if (ballsLine[i] === DELETED_BALL) {
                if (result !== undefined) {
                    result.end = i;
                } else {
                    result = {start: i, end: i};
                }
            } else {
                if (result !== undefined) {
                    break;
                }
            }
        }

        return result;
    }

    swapBallsOnField(fromBallCoords, toBallCoords) {
        let fromBall = this.getBallByCoords(fromBallCoords);
        let toBall = this.getBallByCoords(toBallCoords);
        this.setBallByCoords(fromBallCoords, toBall);
        this.setBallByCoords(toBallCoords, fromBall);
    }

    static isIllegalDirection(direction) {
        return direction.direction === ILLEGAL;
    }

    static isVerticalDirection(direction) {
        return direction.direction === VERTICAL;
    }

    static isHorizontalDirection(direction) {
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

        for (let i = 1; i < ballsLine.length; i++) {
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

    static containsDeletedBalls(line) {
        return line.indexOf(DELETED_BALL) !== -1;
    }

    setRow(row, balls) {
        this.field[row] = balls;
    }

    setColumn(col, balls) {
        if (this.field.length !== balls.length) {
            return;
        }

        let i = 0;
        this.field.forEach((row) => row[col] = balls[i++]);
    }

    _workflow(found, type, scoreCallback) {
        // Report score
        let score = Core.calcScore(found.line);
        scoreCallback(score);

        // Modify the field
        if (type === ROW_TYPE) {
            this.setRow(found.pos, found.line);
            this.refillWith({pos: found.pos, type: type});
        }

        if (type === COLUMN_TYPE) {
            this.setColumn(found.pos, found.line);
            this.refillWith({pos: found.pos, type: type});
        }

        log(this.field);
        stop('we');
    }

    scan(scoreCallback) {
        if (scoreCallback === undefined) {
            throw new Error("Specify scoreCallback");
        }

        let scanRows = true;
        while (scanRows) {
            let rowFound = this.findScoreRow();
            if (rowFound !== undefined) {
                let score = Core.calcScore(rowFound.line);
                scoreCallback(score);
                this.setRow(rowFound.pos, rowFound.line);
                this.refillWith({pos: rowFound.pos, type: ROW_TYPE});
            } else {
                scanRows = false;
                while (true) {
                    let colFound = this.findScoreColumn();
                    if (colFound !== undefined) {
                        let score = Core.calcScore(colFound.line);
                        scoreCallback(score);
                        this.setRow(colFound.pos, colFound.line);
                        this.refillWith({pos: colFound.pos, type: COLUMN_TYPE});
                    } else {
                        break;
                    }
                }
            }
        }
    }

    static calcScore(row) {
        let deletedBalls = row.filter(ball => ball === DELETED_BALL);
        return deletedBalls.reduce((acc, ball) => acc + SCORE_PER_BALL, 0);
    }

    findScoreRow() {
        for (let i = this.field.length - 1; i > -1; i--) {
            let refined = Core.refineBallsLine(this.getRow(i));
            if (Core.containsDeletedBalls(refined)) {
                return {line: refined, pos: i};
            }
        }
    }

    findScoreColumn() {
        for (let i = this.field.length - 1; i > -1; i--) {
            let refined = Core.refineBallsLine(this.getColumn(i));
            if (Core.containsDeletedBalls(refined)) {
                return {line: refined, pos: i};
            }
        }
    }
}

export default Core;