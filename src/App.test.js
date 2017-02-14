import React from 'react';
import ReactDOM from 'react-dom';
import {groupBy} from "lodash";

import App from './App';
import {
    Core, CHANGED_TYPE, HORIZONTAL_DIRECTION, ILLEGAL_DIRECTION, VERTICAL_DIRECTION,
    MIN_SIZE_OF_FIELD, MAX_SIZE_OF_FIELD
} from "./engine/Core";
import {inArray, areFieldsEqual, log} from './engine/helpers';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
});

test('init fail', () => {
    expect(function () {
        new Core(2);
    }).toThrow(new Error("Size of field must be " + MIN_SIZE_OF_FIELD + " x " + MIN_SIZE_OF_FIELD + " minimum"));
    expect(function () {
        new Core(101);
    }).toThrow(new Error("Size of field must be " + MAX_SIZE_OF_FIELD + " x " + MAX_SIZE_OF_FIELD + " maximum"));
});

test('generates ok', () => {
    let core = new Core(5, 4);
    core.generate();
    let field = core.getField();

    // Contain only 1, 2, 3, 4 balls (so - 5 is illegal ball)
    expect(inArray(5, field[0])).toBeFalsy();
    expect(inArray(5, field[1])).toBeFalsy();
    expect(inArray(5, field[2])).toBeFalsy();
    expect(inArray(5, field[3])).toBeFalsy();
    expect(inArray(5, field[4])).toBeFalsy();
});

test('generate balls', () => {
    let core = new Core(5, 5);
    expect(core.generateBalls(0, 0)).toEqual([]);
    expect(core.generateBalls(5, 0)).toEqual([0, 0, 0, 0, 0]);
    expect(core.generateBalls(5).length).toEqual(5); // randomly filled array
    expect(core.generateBalls(1)).not.toEqual([1]); // randomly filled array
});

test('detect move direction', () => {
    expect(Core.detectMoveDirection({row: 0, col: 0}, {row: 1, col: 0})).toEqual({direction: VERTICAL_DIRECTION});
    expect(Core.detectMoveDirection({row: 0, col: 0}, {row: 0, col: 1})).toEqual({direction: HORIZONTAL_DIRECTION});
    expect(Core.detectMoveDirection({row: 0, col: 0}, {row: 0, col: 0})).toEqual({direction: ILLEGAL_DIRECTION}); // the same
    expect(Core.detectMoveDirection({row: 0, col: 0}, {row: 1, col: 1})).toEqual({direction: ILLEGAL_DIRECTION}); // diagonal
    expect(Core.detectMoveDirection({row: 0, col: 0}, {row: 0, col: 2})).toEqual({direction: ILLEGAL_DIRECTION}); // too far
    expect(Core.detectMoveDirection({row: 0, col: 0}, {row: 2, col: 2})).toEqual({direction: ILLEGAL_DIRECTION}); // diagonal too far
});

test('refine balls line', () => {
    expect(Core.refineBallsLine([0])).toEqual([0]);
    expect(Core.refineBallsLine([])).toEqual([]);
    expect(Core.refineBallsLine([1, 1, 1])).toEqual([0, 0, 0]);
    expect(Core.refineBallsLine([2, 1, 1])).toEqual([2, 1, 1]);
    expect(Core.refineBallsLine([1, 1, 1, 1])).toEqual([0, 0, 0, 0]);
    expect(Core.refineBallsLine([1, 2, 2, 2, 3, 4, 2])).toEqual([1, 0, 0, 0, 3, 4, 2]);
    expect(Core.refineBallsLine([1, 2, 1, 2, 1, 1, 1])).toEqual([1, 2, 1, 2, 0, 0, 0]);
});

test('copy column', () => {
    let core = new Core(5, undefined, [
        [3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3],
        [3, 3, 1, 3, 3],
        [1, 1, 2, 1, 3],
        [3, 3, 3, 1, 3]
    ]);
    expect(core.copyColumn(0)).toEqual([3, 3, 3, 1, 3]);
    expect(core.copyColumn(2)).toEqual([3, 3, 1, 2, 3]);
    expect(core.copyColumn(4)).toEqual([3, 3, 3, 3, 3]);
});

test('copy row', () => {
    let core = new Core(5, undefined, [
        [3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3],
        [3, 3, 1, 3, 3],
        [1, 1, 2, 1, 3],
        [3, 3, 3, 1, 3]
    ]);
    expect(core.copyRow(0)).toEqual([3, 3, 3, 3, 3]);
    expect(core.copyRow(2)).toEqual([3, 3, 1, 3, 3]);
    expect(core.copyRow(4)).toEqual([3, 3, 3, 1, 3]);
});

test('set column (wrong column)', () => {
    let core = new Core(5, undefined, [
        [3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3],
        [3, 3, 1, 3, 3],
        [1, 1, 2, 1, 3],
        [3, 3, 3, 1, 3]
    ]);
    core.setColumn(0, [7, 7, 7]);
    expect(areFieldsEqual(core.getField(), [
        [3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3],
        [3, 3, 1, 3, 3],
        [1, 1, 2, 1, 3],
        [3, 3, 3, 1, 3]
    ])).toBeTruthy();

    core.setColumn(0, [7, 7, 7, 7, 7]);
    expect(areFieldsEqual(core.getField(), [
        [7, 3, 3, 3, 3],
        [7, 3, 3, 3, 3],
        [7, 3, 1, 3, 3],
        [7, 1, 2, 1, 3],
        [7, 3, 3, 1, 3]
    ])).toBeTruthy();
});

test('set column (correct column)', () => {
    let core = new Core(5, undefined, [
        [3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3],
        [3, 3, 1, 3, 3],
        [1, 1, 2, 1, 3],
        [3, 3, 3, 1, 3]
    ]);
    core.setColumn(0, [7, 7, 7, 7, 7]);
    expect(areFieldsEqual(core.getField(), [
        [7, 3, 3, 3, 3],
        [7, 3, 3, 3, 3],
        [7, 3, 1, 3, 3],
        [7, 1, 2, 1, 3],
        [7, 3, 3, 1, 3]
    ])).toBeTruthy();
});

test('swap 2 balls on field', () => {
    let core = new Core();
    let field = [
        [3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3],
        [3, 3, 1, 3, 3],
        [1, 1, 2, 1, 3],
        [3, 3, 3, 1, 3]
    ];
    let newField = [
        [3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3],
        [3, 3, 2, 3, 3],
        [1, 1, 1, 1, 3],
        [3, 3, 3, 1, 3]
    ];
    core.setField(field);
    core.swapBallsOnField({row: 2, col: 2}, {row: 3, col: 2});
    expect(areFieldsEqual(core.getField(), newField)).toBeTruthy();
});

test('deleted balls position', () => {
    expect(Core.deletedBallsPos([0, 0, 0, 0, 0])).toEqual({start: 0, end: 4});
    expect(Core.deletedBallsPos([1, 0, 0, 1, 1])).toEqual({start: 1, end: 2});
    expect(Core.deletedBallsPos([1, 1, 0, 0, 0])).toEqual({start: 2, end: 4});
    expect(Core.deletedBallsPos([1, 0, 0, 1, 0, 0])).toEqual({start: 1, end: 2});
    expect(Core.deletedBallsPos([1, 1, 1, 1, 1])).toEqual(undefined);
});

test('refill row (predefined value)', () => {
    let core = new Core(5, undefined, [
        [4, 4, 4, 4, 4],
        [3, 3, 3, 3, 3],
        [3, 3, 2, 3, 3],
        [0, 0, 0, 0, 4],
        [3, 3, 3, 1, 3]
    ]);
    core.refillWith({pos: 3, type: 'row'}, 0);
    expect(areFieldsEqual(core.getField(), [
        [0, 0, 0, 0, 4],
        [4, 4, 4, 4, 3],
        [3, 3, 3, 3, 3],
        [3, 3, 2, 3, 4],
        [3, 3, 3, 1, 3]
    ])).toBeTruthy();
});

test('refill row (2)', () => {
    let core = new Core(5, undefined, [
        [1, 2, 3, 4, 5],
        [5, 1, 2, 3, 4],
        [4, 5, 1, 2, 3],
        [3, 0, 0, 0, 2],
        [1, 3, 4, 5, 1],
    ]);
    core.refillWith({pos: 3, type: 'row'}, 8);
    expect(areFieldsEqual(core.getField(), [
        [1, 8, 8, 8, 5],
        [5, 2, 3, 4, 4],
        [4, 1, 2, 3, 3],
        [3, 5, 1, 2, 2],
        [1, 3, 4, 5, 1],
    ])).toBeTruthy();
});

test('refill row (3)', () => {
    let core = new Core(5, undefined, [
        [1, 2, 3, 4, 5],
        [5, 1, 2, 3, 4],
        [0, 0, 0, 0, 3],
        [3, 1, 2, 3, 2],
        [1, 3, 4, 5, 1],
    ]);
    core.refillWith({pos: 2, type: 'row'}, 8);
    expect(areFieldsEqual(core.getField(), [
        [8, 8, 8, 8, 5],
        [1, 2, 3, 4, 4],
        [5, 1, 2, 3, 3],
        [3, 1, 2, 3, 2],
        [1, 3, 4, 5, 1],
    ])).toBeTruthy();
});

test('refill row (4)', () => {
    let core = new Core(5, undefined, [
        [1, 2, 0, 0, 0],
        [5, 1, 2, 3, 4],
        [3, 1, 3, 1, 3],
        [3, 1, 2, 3, 2],
        [1, 3, 4, 5, 1],
    ]);
    core.refillWith({pos: 0, type: 'row'}, 8);
    expect(areFieldsEqual(core.getField(), [
        [1, 2, 8, 8, 8],
        [5, 1, 2, 3, 4],
        [3, 1, 3, 1, 3],
        [3, 1, 2, 3, 2],
        [1, 3, 4, 5, 1],
    ])).toBeTruthy();
});

test('refill column (predefined value)', () => {
    let core = new Core(6, undefined, [
        [5, 5, 5, 5, 5, 5],
        [4, 4, 4, 4, 4, 5],
        [3, 3, 0, 3, 3, 5],
        [3, 3, 0, 3, 3, 5],
        [1, 2, 0, 4, 4, 5],
        [3, 3, 3, 1, 3, 5],
    ]);

    core.refillWith({pos: 2, type: 'column'}, 7);

    expect(areFieldsEqual(core.getField(), [
        [5, 5, 7, 5, 5, 5],
        [4, 4, 7, 4, 4, 5],
        [3, 3, 7, 3, 3, 5],
        [3, 3, 5, 3, 3, 5],
        [1, 2, 4, 4, 4, 5],
        [3, 3, 3, 1, 3, 5],
    ])).toBeTruthy();
});

test('try to make correct vertical move', () => {
    let core = new Core(5, undefined, [
        [1, 2, 3, 4, 5],
        [5, 1, 2, 3, 4],
        [4, 5, 1, 5, 3],
        [3, 5, 5, 3, 2],
        [1, 3, 4, 5, 1],
    ]);
    expect(core.tryMove({row: 2, col: 3}, {row: 3, col: 3})).toEqual({type: CHANGED_TYPE});
    expect(areFieldsEqual(core.getField(), [
        [1, 2, 3, 4, 5],
        [5, 1, 2, 3, 4],
        [4, 5, 1, 3, 3],
        [3, 5, 5, 5, 2],
        [1, 3, 4, 5, 1],
    ])).toBeTruthy();
});

test('try to make correct vertical move (2)', () => {
    let core = new Core(5, undefined, [
        [1, 2, 3, 4, 5],
        [5, 1, 2, 3, 4],
        [4, 5, 1, 5, 3],
        [3, 5, 5, 3, 2],
        [1, 3, 4, 5, 1],
    ]);
    expect(core.tryMove({row: 3, col: 3}, {row: 2, col: 3})).toEqual({type: CHANGED_TYPE});
    expect(areFieldsEqual(core.getField(), [
        [1, 2, 3, 4, 5],
        [5, 1, 2, 3, 4],
        [4, 5, 1, 3, 3],
        [3, 5, 5, 5, 2],
        [1, 3, 4, 5, 1],
    ])).toBeTruthy();
});

test('try to make correct vertical move (3)', () => {
    let core = new Core(5, undefined, [
        [1, 1, 1, 2, 3],
        [1, 1, 1, 1, 3],
        [4, 5, 1, 5, 1],
        [3, 5, 5, 3, 1],
        [1, 3, 4, 5, 1],
    ]);
    expect(core.tryMove({row: 2, col: 4}, {row: 1, col: 4})).toEqual({type: CHANGED_TYPE});
    expect(areFieldsEqual(core.getField(), [
        [1, 1, 1, 2, 3],
        [1, 1, 1, 1, 1],
        [4, 5, 1, 5, 3],
        [3, 5, 5, 3, 1],
        [1, 3, 4, 5, 1],
    ])).toBeTruthy();
});

test('try to make correct horizontal move', () => {
    let core = new Core(5, undefined, [
        [1, 2, 3, 4, 5],
        [5, 1, 2, 3, 4],
        [4, 5, 1, 5, 3],
        [3, 5, 5, 3, 2],
        [1, 3, 4, 5, 1],
    ]);
    expect(core.tryMove({row: 2, col: 4}, {row: 2, col: 3})).toEqual({type: CHANGED_TYPE});
    expect(areFieldsEqual(core.getField(), [
        [1, 2, 3, 4, 5],
        [5, 1, 2, 3, 4],
        [4, 5, 1, 3, 5],
        [3, 5, 5, 3, 2],
        [1, 3, 4, 5, 1],
    ])).toBeTruthy();
});

test('try to make correct horizontal move (2)', () => {
    let core = new Core(5, undefined, [
        [1, 2, 3, 4, 5],
        [5, 1, 2, 3, 4],
        [4, 5, 1, 5, 3],
        [3, 5, 5, 3, 2],
        [1, 3, 4, 5, 1],
    ]);
    expect(core.tryMove({row: 2, col: 3}, {row: 2, col: 4})).toEqual({type: CHANGED_TYPE});
    expect(areFieldsEqual(core.getField(), [
        [1, 2, 3, 4, 5],
        [5, 1, 2, 3, 4],
        [4, 5, 1, 3, 5],
        [3, 5, 5, 3, 2],
        [1, 3, 4, 5, 1],
    ])).toBeTruthy();
});

test('scan field', () => {
    let core = new Core(5, undefined, [
        [1, 2, 3, 4, 5],
        [5, 1, 2, 3, 4],
        [4, 5, 1, 2, 3],
        [3, 5, 5, 5, 2],
        [1, 3, 4, 5, 1],
    ]);
    let fullScore = 0;
    core.scan(function (score) {
        fullScore += score;
    });
    expect(fullScore).not.toBeLessThan(30);
});

test('find score row / column', () => {
    let core = new Core(5, undefined, [
        [1, 2, 3, 4, 4],
        [5, 1, 2, 3, 4],
        [4, 5, 1, 4, 4],
        [3, 5, 5, 5, 2],
        [1, 3, 4, 5, 1],
    ]);

    expect(core.findScoreRow()).toEqual({"line": [3, 0, 0, 0, 2], "pos": 3});
    expect(core.findScoreColumn()).toEqual({"line": [0, 0, 0, 2, 1], "pos": 4});
});

test('calc score', () => {
    expect(Core.calcScore([1, 2])).toEqual(0);
    expect(Core.calcScore([1, 0])).toEqual(10); // no protection from too short sequences
    expect(Core.calcScore([1, 0, 0, 0])).toEqual(30);
    expect(Core.calcScore([3, 3, 0, 0, 0])).toEqual(30);
});

test('can make next move', () => {
    let core = new Core(5, undefined, [
        [5, 2, 3, 4, 5],
        [5, 1, 2, 3, 4],
        [4, 5, 1, 2, 5],
        [3, 1, 5, 5, 2],
        [1, 3, 4, 5, 5]]);
    expect(core.canMakeNextMove()).toBeTruthy();
});

test('cannot make next move', () => {
    let core = new Core(5, undefined, [
        [1, 7, 6, 2, 4],
        [1, 3, 3, 5, 6],
        [2, 2, 1, 4, 6],
        [1, 6, 1, 1, 3],
        [2, 6, 7, 6, 3]]);
    expect(core.canMakeNextMove()).toBeFalsy();
});

test('(temp!) cannot make next move (2)', () => {
    let core = new Core(5, undefined, [
        [1, 1, 2, 4, 7],
        [1, 4, 5, 1, 3],
        [4, 6, 3, 7, 1],
        [3, 5, 7, 4, 2],
        [4, 7, 5, 3, 7]]);
    expect(core.canMakeNextMove()).toBeFalsy();
});

test('can make next move in the smallest group (r - types)', () => {
    expect(Core._canMakeNextMove(([
        [5, 5, 0],
        [0, 0, 5],
        [0, 0, 0]
    ]), 0)).toBeTruthy();

    expect(Core._canMakeNextMove(([
        [5, 0, 0],
        [5, 0, 5],
        [0, 5, 0]
    ]), 0)).toBeTruthy();

    expect(Core._canMakeNextMove(([
        [0, 0, 5],
        [0, 0, 5],
        [0, 5, 0]
    ]), 0)).toBeTruthy();

    expect(Core._canMakeNextMove(([
        [0, 5, 5],
        [5, 0, 0],
        [0, 0, 0]
    ]), 0)).toBeTruthy();

    expect(Core._canMakeNextMove(([
        [0, 5, 0],
        [5, 0, 0],
        [5, 0, 0]
    ]), 0)).toBeTruthy();

    expect(Core._canMakeNextMove(([
        [0, 0, 0],
        [0, 0, 5],
        [5, 5, 0]
    ]), 0)).toBeTruthy();

    expect(Core._canMakeNextMove(([
        [0, 0, 5],
        [0, 5, 0],
        [0, 5, 0]
    ]), 0)).toBeTruthy();

    expect(Core._canMakeNextMove(([
        [5, 0, 0],
        [0, 5, 0],
        [0, 5, 0]
    ]), 0)).toBeTruthy();

    expect(Core._canMakeNextMove(([
        [0, 0, 0],
        [0, 5, 5],
        [5, 0, 0]
    ]), 0)).toBeTruthy();

    expect(Core._canMakeNextMove(([
        [5, 0, 0],
        [0, 5, 5],
        [0, 0, 0]
    ]), 0)).toBeTruthy();

    expect(Core._canMakeNextMove(([
        [0, 0, 5],
        [5, 5, 0],
        [0, 0, 0]
    ]), 0)).toBeTruthy();

    expect(Core._canMakeNextMove(([
        [0, 0, 0],
        [5, 0, 0],
        [0, 5, 5]
    ]), 0)).toBeTruthy();

    expect(Core._canMakeNextMove(([
        [0, 5, 0],
        [0, 0, 5],
        [0, 0, 5]
    ]), 0)).toBeTruthy();
});

test('can make next move in the smallest group (v - types)', () => {
    expect(Core._canMakeNextMove(([
        [5, 0, 5],
        [0, 5, 0],
        [0, 0, 0]
    ]), 0)).toBeTruthy();

    expect(Core._canMakeNextMove(([
        [0, 0, 5],
        [0, 5, 0],
        [0, 0, 5]
    ]), 0)).toBeTruthy();

    expect(Core._canMakeNextMove(([
        [0, 0, 0],
        [0, 5, 0],
        [5, 0, 5]
    ]), 0)).toBeTruthy();

    expect(Core._canMakeNextMove(([
        [5, 0, 0],
        [0, 5, 0],
        [5, 0, 0]
    ]), 0)).toBeTruthy();
});

test('copy3x3Field', () => {
    let core = new Core(5, undefined, [
        [1, 8, 8, 4, 5],
        [5, 2, 3, 3, 4],
        [4, 1, 2, 2, 5],
        [3, 1, 5, 5, 2],
        [1, 3, 4, 5, 5]]);

    expect(areFieldsEqual(core._copy3x3Field({row: 0, col: 0}), [
        [1, 8, 8],
        [5, 2, 3],
        [4, 1, 2],
    ])).toBeTruthy();

    expect(areFieldsEqual(core._copy3x3Field({row: 2, col: 2}), [
        [2, 2, 5],
        [5, 5, 2],
        [4, 5, 5],
    ])).toBeTruthy();
});
