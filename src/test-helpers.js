
function inArray(needle, haystack) {
    var count = haystack.length;
    for (var i = 0; i < count; i++) {
        if (haystack[i] === needle) {
            return true;
        }
    }
    return false;
}

function areFieldsEqual(arr1, arr2) {
    let result = true;

    function areRowsEqual(r1, r2) {
        let result = true;

        if (r1.length != r2.length) {
            result = false;
        } else {
            for (let i = 0; i < r1.length; i++) {
                if (r1[i] !== r2[i]) {
                    result = false;
                    break;
                }
            }
        }

        return result;
    }

    if (arr1.length != arr2.length) {
        return false;
    }

    let arrLength = arr1.length;

    for (let i = 0; i < arrLength; i++) {
        let r1 = arr1[i];
        let r2 = arr2[i];

        if (!areRowsEqual(r1, r2)) {
            result = false;
            break;
        }
    }

    return result;
}


export { inArray, areFieldsEqual };