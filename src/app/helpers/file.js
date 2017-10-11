'use strict';

import * as fs from 'fs';

export default class File {
    fileName;
    mode;

    constructor (fileName, mode) {
        this.fileName = fileName;
        this.mode = mode;
    }

    open() {
        return new Promise((resolve, reject) => {
            fs.open(this.fileName, this.mode, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    read() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.fileName, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    replaceContent(data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.fileName, data, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
}
