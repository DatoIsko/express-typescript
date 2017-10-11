'use strict';

import {
    UNAUTHORIZED_CODE, BAD_REQUEST_CODE, GONE_CODE, FORBIDDEN_CODE,
    VALIDATION_ERROR_CODE
} from '../configs/status-codes';
import { PERMISSION_DENIED, SOMETHING_WENT_WRONG, VALIDATION_ERROR } from '../configs/response-messages';
import params from '../configs/params';
import File from '../helpers/file';
import moment from 'moment';

export class AuthError extends Error {
    status = UNAUTHORIZED_CODE;
    message;
    errors;
    constructor(message, errors = null) {
        super();
        this.message = message;
        this.errors = errors;
    }
}

export class BadRequest extends Error {
    status = BAD_REQUEST_CODE;
    message;
    errors;
    constructor(message, errors = null) {
        super();
        this.message = message;
        this.errors = errors;
    }
}

export class Forbidden extends Error {
    status = FORBIDDEN_CODE;
    message = PERMISSION_DENIED;
    errors;
    constructor ( errors = null) {
        super();
        this.errors = errors;
    }
}

export class Gone extends Error {
    status = GONE_CODE;
    message;
    errors;
    constructor(message, errors = null) {
        super();
        this.message = message;
        this.errors = errors;
    }
}

export class ValidationError extends Error {
    status = VALIDATION_ERROR_CODE;
    message = VALIDATION_ERROR;
    errors;
    constructor(errors) {
        super();
        this.errors = errors;
    }
}

export class ServiceUnavailable extends Error {
    status = BAD_REQUEST_CODE;
    message = SOMETHING_WENT_WRONG;
    errors;
    constructor(message, errors = null) {
        super();

        if (errors) {
            this.message = message;
            this.errors = errors;
        } else {
            if (typeof message === 'string') {
                this.message = message;
            } else {
                this.errors = message;
            }
        }

        const file = new File(params.logFile, 'a+');

        file.open().then(() => {
            file.read().then((content) => {
                const log =
                    `Date and Time: ${moment().format('YYYY-MM-DD HH:mm:ss')}
                     Actual Status: ${this.errors ? this.errors.status : 'no status'}
                     Developer Message: ${this.message}
                     Error Message: ${this.errors ? this.errors.message : ''}`;

                const newContent = content ? `${content}\n\n${log}` : log;
                file.replaceContent(newContent).then(() => {
                    console.dir('Loged', { colors: true, depth: 10 });
                });
            });
        });
    }
}
