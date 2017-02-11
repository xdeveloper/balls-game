import {log, stop} from './helpers';
import {range} from 'lodash';

const VERTICAL_DIRECTION = 'vertical-direction';
const HORIZONTAL_DIRECTION = 'horizontal-direction';
const ILLEGAL_DIRECTION = 'illegal-direction';
const DELETED_BALL = 0;

const ROW_TYPE = 'row';
const COLUMN_TYPE = 'column';

const ILLEGAL_TYPE = 'illegal';
const ILLEGAL_THE_SAME_BALLS_TYPE = 'illegal-the-same-balls';
const UNCHANGED_TYPE = 'unchanged';
const CHANGED_TYPE = 'changed';

const SCORE_PER_BALL = 10;
const HOW_MANY_BALL_COLOURS = 4;

const MIN_SIZE_OF_FIELD = 5;
const MAX_SIZE_OF_FIELD = 20;

class Core {

    // For unit testing
    constructor(field) {
        this.field = field;
    }

    /**
     * Generates the field of n x n size
     * (only square type, rectangle is impossible)
     * @param n size of field
     */
    generate(n) {
        if (n < MIN_SIZE_OF_FIELD) {
            throw new Error("Size of field must be 5 x 5 minimum");
        }
        if (n > MAX_SIZE_OF_FIELD) {
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

        this.setField(field);
    }

    getField() {
        return this.field;
    }

    setField(field) {
        this.field = field;
    }

    /**
     * Generates a random single ball
     * @returns {number} ball
     */
    static generateBall() {
        return Math.floor(Math.random() * (HOW_MANY_BALL_COLOURS - 1 + 1)) + 1;
    }

    /**
     * Generates array of balls
     * @param howManyBalls balls count
     * @param ball array with predefined ball (or random ball if undefined)
     */
    static generateBalls(howManyBalls, ball) {
        let generator = ball === undefined ? Core.generateBall : () => ball;
        return range(howManyBalls).map(generator);
    }

    static detectMoveDirection(ball1Coords, ball2Coords) {
        function neighbours(pos1, pos2) {
            return (Math.abs(pos1 - pos2) === 1);
        }

        let {row: row1, col: col1} = ball1Coords;
        let {row: row2, col: col2} = ball2Coords;

        let direction;
        if (col1 === col2 && neighbours(row1, row2)) {
            direction = VERTICAL_DIRECTION;
        } else if (row1 === row2 && neighbours(col1, col2)) {
            direction = HORIZONTAL_DIRECTION;
        } else {
            direction = ILLEGAL_DIRECTION;
        }

        return {direction: direction}
    }

    static isIllegalDirection(direction) {
        return direction.direction === ILLEGAL_DIRECTION;
    }

    /**
     * Try to make a move
     *
     * returns result of trying.
     * In case of successful moving also modifies Field
     *
     * @param fromBallCoords
     * @param toBallCoords
     * @returns type: {(ILLEGAL_THE_SAME_BALLS_TYPE|ILLEGAL_TYPE|CHANGED_TYPE|UNCHANGED_TYPE)} result of trying
     */
    tryMove(fromBallCoords, toBallCoords) {
        if (this.field === undefined) {
            throw new Error("Generate field first");
        }

        let result;

        if (this.getBall(fromBallCoords) === this.getBall(toBallCoords)) {
            result = {type: ILLEGAL_THE_SAME_BALLS_TYPE};
        } else if (Core.isIllegalDirection(Core.detectMoveDirection(fromBallCoords, toBallCoords))) {
            result = {type: ILLEGAL_TYPE};
        } else {
            this.swapBallsOnField(fromBallCoords, toBallCoords);
            // Vertical
            if (Core.containsDeletedBalls(Core.refineBallsLine(this.copyRow(toBallCoords.row)))) {
                result = {type: CHANGED_TYPE};
            } else {
                // Horizontal
                if (Core.containsDeletedBalls(Core.refineBallsLine(this.copyColumn(toBallCoords.col)))) {
                    result = {type: CHANGED_TYPE};
                } else {
                    // Nothing found
                    result = {type: UNCHANGED_TYPE};
                    // Return balls back
                    this.swapBallsOnField(fromBallCoords, toBallCoords);
                }
            }
        }

        return result;
    }

    canMakeNextMove() {
        return false;
    }

    /**
     * Refill some area with new balls
     *
     * @param coords - coordinate of position to refill
     * @param coords.pos {Number} position
     * @param coords.type {(ROW_TYPE|COLUMN_TYPE)} } type
     * @param value {Number|String|undefined} (used in unit tests only, do not pass it in real code)
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

    /**
     *
     * @param balls array of balls
     * @returns {start: x, end: y} or undefined
     */
    static deletedBallsPos(balls) {
        let result;
        for (let i = 0; i < balls.length; i++) {
            if (balls[i] === DELETED_BALL) {
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

    /**
     *
     * @param from {row: x, col: y}
     * @param to {row: x, col: y}
     */
    swapBallsOnField(from, to) {
        log("Field before swap");
        log(this.getField());

        let fromBall = this.getBall(from);
        let toBall = this.getBall(to);
        this.setBall(from, toBall);
        this.setBall(to, fromBall);

        log("Field after swap");
        log(this.getField());
    }

    getBall(coords) {
        return this.field[coords.row][coords.col];
    }

    setBall(coords, ball) {
        this.field[coords.row][coords.col] = ball;
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

    static containsDeletedBalls(balls) {
        return balls.indexOf(DELETED_BALL) !== -1;
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

    scan(scoreCallback, updatedFieldCallback) {
        if (scoreCallback === undefined) {
            throw new Error("Specify scoreCallback");
        }

        let scanRows = true;
        while (scanRows) {
            let rowFound = this.findScoreRow();
            if (rowFound !== undefined) {
                let score = Core.calcScore(rowFound.line);
                let r = scoreCallback(score, rowFound.pos, ROW_TYPE, rowFound.line);
                if (r) return;

                this.setRow(rowFound.pos, rowFound.line);
                if (updatedFieldCallback !== undefined) {
                    updatedFieldCallback();
                }
                this.refillWith({pos: rowFound.pos, type: ROW_TYPE});
            } else {
                scanRows = false;
                while (true) {
                    let colFound = this.findScoreColumn();
                    if (colFound !== undefined) {
                        let colFoundLine = colFound.line;
                        let score = Core.calcScore(colFoundLine);
                        let r = scoreCallback(score, colFound.pos, COLUMN_TYPE, colFoundLine);
                        if (r) return;

                        this.setColumn(colFound.pos, colFoundLine);
                        if (updatedFieldCallback !== undefined) {
                            updatedFieldCallback();
                        }
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
        let result = deletedBalls.reduce((acc, ball) => acc + SCORE_PER_BALL, 0);
        return result;
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

    getHowManyBallColours() {
        return HOW_MANY_BALL_COLOURS;
    }
}

export {
    Core,
    UNCHANGED_TYPE,
    CHANGED_TYPE,
    ILLEGAL_TYPE,
    ILLEGAL_THE_SAME_BALLS_TYPE,
    HORIZONTAL_DIRECTION,
    VERTICAL_DIRECTION,
    ILLEGAL_DIRECTION,
    ROW_TYPE,
    COLUMN_TYPE
}