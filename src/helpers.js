import {zip} from 'lodash';

function inArray(needle, haystack) {
    return haystack.every((e) => e === needle);
}

function areFieldsEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }

    return zip(arr1, arr2).every((pair) => {
        let row1 = pair[0];
        let row2 = pair[1];
        return (row1.length !== row2.length) ? false : zip(row1, row2).every((pair) => pair[0] === pair[1]);
    })
}

function serializeCoord(coords) {
    return '{row: ' + coords.row + ' , col: ' + coords.col + '}';
}

function log(message) {
    console.log(message)
}

function stop(message) {
    console.log(message);
    throw new Error("Stopped after " + message);
}

var add = (function () {
    var counter = 0;
    return function () {
        if (counter !== 10) {
            return counter += 1;
        } else {
            throw new Error("Stopped after ");
        }
    }
})(10);

export {log, add, stop, inArray, areFieldsEqual, serializeCoord};