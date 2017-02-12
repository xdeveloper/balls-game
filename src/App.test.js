import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {Core} from './engine/Core.js';
import {inArray, areFieldsEqual, log} from './engine/helpers';
import {CHANGED_TYPE, HORIZONTAL_DIRECTION, ILLEGAL_DIRECTION, VERTICAL_DIRECTION} from "./engine/Core";
import {groupBy} from "lodash";

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
});

test('generates ok', () => {
    let core = new Core();
    core.generate(5);
    let field = core.getField();

    // Contain only 1, 2, 3, 4 balls (so - 5 is illegal ball)
    expect(inArray(5, field[0])).toBeFalsy();
    expect(inArray(5, field[1])).toBeFalsy();
    expect(inArray(5, field[2])).toBeFalsy();
    expect(inArray(5, field[3])).toBeFalsy();
    expect(inArray(5, field[4])).toBeFalsy();
});

test('generates fail', () => {
    expect(function () {
        new Core().generate(2);
    }).toThrow(new Error("Size of field must be 5 x 5 minimum"));

    expect(function () {
        new Core().generate(101);
    }).toThrow(new Error("Size of field must be 100 x 100 maximum"));

});

test('generate balls', () => {
    expect(Core.generateBalls(0, 0)).toEqual([]);
    expect(Core.generateBalls(5, 0)).toEqual([0, 0, 0, 0, 0]);
    expect(Core.generateBalls(5).length).toEqual(5); // randomly filled array
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
    let core = new Core([
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
    let core = new Core([
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
    let core = new Core([
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
    let core = new Core([
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
    let core = new Core([
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
    let core = new Core([
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
    let core = new Core([
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
    let core = new Core([
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
    let core = new Core([
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

test('try to make correct move', () => {
    let core = new Core([
        [1, 2, 3, 4, 5],
        [5, 1, 2, 3, 4],
        [4, 5, 1, 5, 3],
        [3, 5, 5, 3, 2],
        [1, 3, 4, 5, 1],
    ]);

    let res = core.tryMove({row: 2, col: 3}, {row: 3, col: 3});

    expect(res).toEqual({type: CHANGED_TYPE});
    expect(areFieldsEqual(core.getField(), [
        [1, 2, 3, 4, 5],
        [5, 1, 2, 3, 4],
        [4, 5, 1, 3, 3],
        [3, 5, 5, 5, 2],
        [1, 3, 4, 5, 1],
    ])).toBeTruthy();
});

test('scan field', () => {
    let core = new Core([
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
    let core = new Core([
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
    let core = new Core([
        [5, 2, 3, 4, 5],
        [5, 1, 2, 3, 4],
        [4, 5, 1, 2, 5],
        [3, 1, 5, 5, 2],
        [1, 3, 4, 5, 5]]);

    let canMakeNextMove = core.canMakeNextMove();

    log(canMakeNextMove);

    expect(canMakeNextMove).toBeTruthy();
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
    let core = new Core([
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