import {log, logIf} from './helpers';
import {filter, find, flatten, range, uniq} from 'lodash';
import * as Random from "random-js";

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
const FIELD_SIZE_ONLY_CAN_DO_NEXT_MOVE = 6;

class Core {

    // For unit testing
    constructor(n, c, field) {
        Core.checkFieldSize(n);

        this.n = n;
        this.howManyBallColours = c ? c : HOW_MANY_BALL_COLOURS;
        this.field = field;

        this.randomGenerator = require("random-js")(); // uses the nativeMath engine;
    }

    /**
     * Generates the field of n x n size
     * (only square type, rectangle is impossible)
     * @param n size of field
     */
    generate() {
        let field = [];
        range(this.n).forEach(() => {
            let row = [];
            range(this.n).forEach(() => {
                row.push(this.generateBall(this.howManyBallColours));
            });
            field.push(row);
        });

        this.setField(field);

        if (!this.canStartTheGame()) {
            // "Field already has score row / col. Or first move is impossible. Regenerate again."

            this.generate(this.n);
        }
    }

    canStartTheGame() {
        let hasNotScore = !(this.findScoreRow() || this.findScoreColumn());
        let canMakeMove = this.canMakeNextMove();

        if (this.n > FIELD_SIZE_ONLY_CAN_DO_NEXT_MOVE) {
            return canMakeMove;
        } else {
            return hasNotScore && canMakeMove;
        }
    }

    static checkFieldSize(n) {
        if (n < MIN_SIZE_OF_FIELD) {
            throw new Error("Size of field must be " + MIN_SIZE_OF_FIELD + " x " + MIN_SIZE_OF_FIELD + " minimum");
        }
        if (n > MAX_SIZE_OF_FIELD) {
            throw new Error("Size of field must be " + MAX_SIZE_OF_FIELD + " x " + MAX_SIZE_OF_FIELD + " maximum");
        }
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
    generateBall() {
        return this.randomGenerator.integer(1, this.howManyBallColours);
    }

    /**
     * Generates array of balls
     * @param howManyBalls balls count
     * @param ball array with predefined ball (or random ball if undefined)
     */
    generateBalls(howManyBalls, ball) {
        return range(howManyBalls).map(ball === undefined ? this.generateBall.bind(this) : () => ball);
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
        let result;

        if (this.getBall(fromBallCoords) === this.getBall(toBallCoords)) {
            result = {type: ILLEGAL_THE_SAME_BALLS_TYPE};
        } else if (Core.isIllegalDirection(Core.detectMoveDirection(fromBallCoords, toBallCoords))) {
            result = {type: ILLEGAL_TYPE};
        } else {
            this.swapBallsOnField(fromBallCoords, toBallCoords);
            // Vertical
            if (this.rowHasScore(toBallCoords.row) || this.rowHasScore(fromBallCoords.row)) {
                result = {type: CHANGED_TYPE};
            } else {
                // Horizontal
                if (this.columnHasScore(toBallCoords.col) || this.columnHasScore(fromBallCoords.col)) {
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

    /**
     * Refill some area with new balls
     *
     * @param coords - coordinate of position to refill
     * @param coords.pos {Number} position
     * @param coords.type {(ROW_TYPE|COLUMN_TYPE)} } type
     * @param value {Number|undefined} (used in unit tests only, do not pass it in real code)
     */
    refillWith(coords, value = undefined) {
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
        let newBallsLine = this.generateBalls(column.length - survivors.length, value).concat(survivors);
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

        let newlyGeneratedBalls = this.generateBalls(end - start + 1, value);
        modifyLastRow(this.getRow(0), newlyGeneratedBalls, start, end);
    }

    /**
     *
     * @param balls array of balls
     * @returns {start: {Number}, end: {Number}} or undefined
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
     * @param from
     * @param from.row {number}
     * @param from.col {number}
     *
     * @param to
     * @param to.row {number}
     * @param to.col {number}
     */
    swapBallsOnField(from, to) {
        let fromBall = this.getBall(from);
        let toBall = this.getBall(to);
        this.setBall(from, toBall);
        this.setBall(to, fromBall);
    }

    getBall(coords) {
        return this.getField()[coords.row][coords.col];
    }

    setBall(coords, ball) {
        this.getField()[coords.row][coords.col] = ball;
    }

    getRow(row) {
        return this.getField()[row];
    }

    getColumn(col) {
        return this.getField().map((row) => row[col]);
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
        this.getField()[row] = balls;
    }

    setColumn(col, balls) {
        if (this.getField().length !== balls.length) {
            return;
        }

        let i = 0;
        this.getField().forEach((row) => row[col] = balls[i++]);
    }

    /**
     * Scans the whole field for score, callbacks in case of new score, refills field with new balls
     * @param scoreCallback
     * @param updatedFieldCallback
     */
    scan(scoreCallback = () => {
    }, updatedFieldCallback = () => {
    }) {
        let process = function (line, setter, refillType) {
            let score = Core.calcScore(line.line);
            if (scoreCallback(score, line.pos, ROW_TYPE, line.line)) {
                log('User stopped scan');
                return;
            }
            setter = setter.bind(this);
            setter(line.pos, line.line);
            updatedFieldCallback();
            this.refillWith({pos: line.pos, type: refillType});

        }.bind(this);

        let scanRows = true;
        while (scanRows) {
            let rowFound = this.findScoreRow();
            if (rowFound !== undefined) {
                if (process(rowFound, this.setRow, ROW_TYPE)) return;
            } else {
                scanRows = false;
                while (true) {
                    let colFound = this.findScoreColumn();
                    if (colFound !== undefined) {
                        if (process(colFound, this.setColumn, COLUMN_TYPE)) return;
                        scanRows = true;
                    } else {
                        break;
                    }
                }
            }
        }
    }

    static calcScore(row) {
        return row.filter(ball => ball === DELETED_BALL).reduce((acc, ball) => acc + SCORE_PER_BALL, 0);
    }

    /**
     *  Finds pos of row or column with score and transforms it to score row (filled with deleted balls)
     *  @param getter {Function}
     * @returns {{line: *, pos: number}} or undefined
     */
    _findScore(getter) {
        for (let i = this.getField().length - 1; i > -1; i--) {
            let line = getter.call(this, i);
            if (Core.containsDeletedBalls(Core.refineBallsLine(line))) {
                return {line: Core.refineBallsLine(line), pos: i};
            }
        }
        return undefined;
    }

    findScoreRow() {
        return this._findScore(this.getRow);
    }

    findScoreColumn() {
        return this._findScore(this.getColumn);
    }

    getHowManyBallColours() {
        return this.howManyBallColours;
    }

    _copy3x3Field(pos) {
        let _3x3Field = [];
        range(3).forEach((rOffset) => {
            let _row = [];
            range(3).forEach((cOffset) => {
                _row.push(this.getBall({row: pos.row + rOffset, col: pos.col + cOffset}));
            });
            _3x3Field.push(_row);
        });
        return _3x3Field;
    }

    canMakeNextMove() {
        let rng = range(this.getField().length - 2);

        for (let r = 0; r < rng.length; r++) {
            for (let c = 0; c < rng.length; c++) {
                if (Core._canMakeNextMove(this._copy3x3Field({row: r, col: c}))) {
                    log('Into the square 3x3 with top left corner - row = ' + r + ', col = ' + c);
                    return true;
                }
            }
        }
        return false;
    }

    static _cannotMakeNextMove(_3x3Field, ballToIgnore = undefined) {
        return !this._canMakeNextMove(_3x3Field, ballToIgnore);
    }

    static _canMakeNextMove(_3x3Field, ballToIgnore = undefined) {
        let figIndex = 1;

        function matchFigure(_1, _2, _3, ball) {
            let [r1, c1] = _1;
            let [r2, c2] = _2;
            let [r3, c3] = _3;
            let match = _3x3Field[r1][c1] === ball && _3x3Field[r2][c2] === ball && _3x3Field[r3][c3] === ball;

            logIf(false, "Found figure (type = " + figIndex + ")");
            figIndex++;
            return match;
        }

        let uniqueBalls = uniq(flatten(_3x3Field));

        if (ballToIgnore !== undefined) {
            uniqueBalls = filter(uniqueBalls, (ball) => ball !== ballToIgnore);
        }

        let foundBall = find(uniqueBalls, (ball) => {
            let matchRTypes =
                matchFigure([0, 0], [0, 1], [1, 2], ball) ||
                matchFigure([0, 0], [1, 0], [2, 1], ball) ||
                matchFigure([0, 2], [1, 2], [2, 1], ball) ||
                matchFigure([0, 2], [0, 1], [1, 0], ball) ||
                matchFigure([0, 1], [1, 0], [2, 0], ball) ||
                matchFigure([1, 2], [2, 1], [2, 0], ball) ||
                matchFigure([0, 2], [1, 1], [2, 1], ball) ||
                matchFigure([0, 0], [1, 1], [2, 1], ball) ||
                matchFigure([1, 2], [1, 1], [2, 0], ball) ||
                matchFigure([0, 0], [1, 1], [1, 2], ball) ||
                matchFigure([1, 0], [1, 1], [0, 2], ball) ||
                matchFigure([1, 0], [2, 1], [2, 2], ball) ||
                matchFigure([0, 1], [1, 2], [2, 2], ball);

            let matchVTypes =
                matchFigure([0, 0], [1, 1], [0, 2], ball) ||
                matchFigure([0, 2], [1, 1], [2, 2], ball) ||
                matchFigure([2, 0], [1, 1], [2, 2], ball) ||
                matchFigure([0, 0], [1, 1], [2, 0], ball);

            if (matchRTypes || matchVTypes) {
                return true;
            } else {
                return false;
            }
        });

        return foundBall !== undefined;
    }

    rowHasScore(row) {
        return this._hasScore(row, this.copyRow.bind(this));
    }

    columnHasScore(col) {
        return this._hasScore(col, this.copyColumn.bind(this));
    }

    _hasScore(pos, getter) {
        return Core.containsDeletedBalls(Core.refineBallsLine(getter(pos)));
    }
}

export {
    Core,
    MIN_SIZE_OF_FIELD,
    MAX_SIZE_OF_FIELD,
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