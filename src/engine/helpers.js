import {zip} from 'lodash';

function inArray(needle, haystack) {
    return haystack.every((e) => e === needle);
}

function areFieldsEqual(arr1, arr2) {
    if (!(arr1 && arr2)) {
        throw new Error('Check your arrays');
    }

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

function logIf(predicate, message) {
    if (predicate) {
        log(message);
    }
}

function logIfNot(predicate, message) {
    logIf(!predicate, message);
}

function stop(message) {
    console.log(message);
    throw new Error("Stopped after " + message);
}

function sessionStorageLog(val) {
    sessionStorage.setItem('ua-com-abakumov-balls-game', val);
}

export {log, logIf, logIfNot, sessionStorageLog, stop, inArray, areFieldsEqual, serializeCoord};