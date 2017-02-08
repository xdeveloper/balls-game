import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Core from './core.js';
import {inArray, areFieldsEqual} from './test-helpers';

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

test('detect swap direction', () => {
    expect(Core.detectSwapDirection({row: 0, col: 0}, {row: 1, col: 0})).toEqual({direction: 'vertical'});
    expect(Core.detectSwapDirection({row: 0, col: 0}, {row: 0, col: 1})).toEqual({direction: 'horizontal'});
    expect(Core.detectSwapDirection({row: 0, col: 0}, {row: 0, col: 0})).toEqual({direction: 'illegal'}); // the same
    expect(Core.detectSwapDirection({row: 0, col: 0}, {row: 1, col: 1})).toEqual({direction: 'illegal'}); // diagonal
    expect(Core.detectSwapDirection({row: 0, col: 0}, {row: 0, col: 2})).toEqual({direction: 'illegal'}); // too far
    expect(Core.detectSwapDirection({row: 0, col: 0}, {row: 2, col: 2})).toEqual({direction: 'illegal'}); // diagonal too far
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

test('do swap', () => {
    let core = new Core();

    let field = [
        [3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3],
        [3, 3, 1, 3, 3],
        [1, 1, 2, 1, 3],
        [3, 3, 3, 1, 3]
    ];

    core.setField(field);
    core.swap({row: 2, col: 2}, {row: 3, col: 2});

    let newField = core.getField();

    console.log(newField);


});