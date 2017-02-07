'use strict';

class Core {
    constructor() {
    }

    generate(n) {
        if (n < 5) {
            throw new Error("Size of field must be 5 x 5 minimum");
        }

        let whole = new Array(n);

        for (let r = 0; r < n; r++) {

            let row = new Array(r);

            for (let c = 0; c < n; c++) {
                row[c] = 0;
            }

            whole[r] = row;
        }

        return whole;
    }
}

export default Core;
