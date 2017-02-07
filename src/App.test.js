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
    let field = new Core().generate(5);

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

});

test('detect swap direction', () => {
    let core = new Core();

    expect(core.detectSwapDirection([0, 0], [1, 0])).toEqual({direction: 'vertical'});
    expect(core.detectSwapDirection([0, 0], [0, 1])).toEqual({direction: 'horizontal'});
    expect(core.detectSwapDirection([0, 0], [0, 0])).toEqual({direction: 'illegal'}); // the same
    expect(core.detectSwapDirection([0, 0], [1, 1])).toEqual({direction: 'illegal'}); // diagonal
    expect(core.detectSwapDirection([0, 0], [0, 2])).toEqual({direction: 'illegal'}); // too far
    expect(core.detectSwapDirection([0, 0], [2, 2])).toEqual({direction: 'illegal'}); // diagonal too far
});
