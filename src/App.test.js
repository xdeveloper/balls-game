import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Core from './core.js';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
});

function inArray(needle, haystack) {
    var count = haystack.length;
    for (var i = 0; i < count; i++) {
        if (haystack[i] === needle) {
            return true;
        }
    }
    return false;
}


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

test('do swap', () => {
    let core = new Core();

    let field = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [1, 1, 2, 1, 0],
        [0, 0, 0, 1, 0]
    ];

    core.setField(field);
    core.swap({row: 2, col: 2}, {row: 3, col: 2});

    //let newField = core.getField();


});
