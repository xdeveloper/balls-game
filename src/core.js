'use strict';

class Core {
    constructor() {
    }

    generate(n) {
        if (n < 5) {
            throw new Error("Size of field must be 5 x 5 minimum");
        }

        if (n > 100) {
            throw new Error("Size of field must be 100 x 100 maximum");
        }

        let whole = new Array(n);

        for (let r = 0; r < n; r++) {

            let row = new Array(r);

            for (let c = 0; c < n; c++) {
                row[c] = this.generateBall();
            }

            whole[r] = row;
        }

        return whole;
    }

    generateBall() {
        return Math.floor(Math.random() * (4 - 1 + 1)) + 1;
    }

    /**
     * Vertical, Horizontal, Illegal
     */
    detectSwapDirection(firstBallCoords, secondBallCoords) {

        function neighbours(pos1, pos2) {
            return (Math.abs(pos1 - pos2) == 1);
        }

        let [row1, col1] = firstBallCoords;
        let [row2, col2] = secondBallCoords;

        let direction;
        if (col1 === col2 && neighbours(row1, row2)) {
            direction = VERTICAL;
        } else if (row1 === row2 && neighbours(col1, col2)) {
            direction = HORIZONTAL;
        } else {
            direction = ILLEGAL;
        }

        return {direction: direction}
    }

}

const VERTICAL = 'vertical';
const HORIZONTAL = 'horizontal';
const ILLEGAL = 'illegal';

export default Core;
