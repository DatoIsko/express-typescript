'use strict';

import {
    EMAIL_MAX_LENGTH, MIN_LENGTH, NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH
} from '../../configs/constants';
import {
    INVALID_EMAIL, INVALID_PASSWORD, LENGTH_REQUIRED, ONLY_ALPHA_NUMERIC,
    REQUIRED
} from '../../configs/validation-messages';

export default {
    signIn: {
        validation: {
            'email': {
                in: 'body',
                isEmail: {
                    errorMessage: INVALID_EMAIL
                },
                notEmpty: {
                    errorMessage: REQUIRED('Email')
                },
                isLength: {
                    options: [{min: MIN_LENGTH, max: EMAIL_MAX_LENGTH}],
                    errorMessage: LENGTH_REQUIRED('Email', {max: EMAIL_MAX_LENGTH})
                }
            },
            'password': {
                in: 'body',
                notEmpty: {
                    errorMessage: REQUIRED('Password')
                },
                matches: {
                    options: [/^(?=.*?[a-zA-Z])(?=.*?[0-9])[\w@#$%^?~-]{0,128}$/],
                    errorMessage: INVALID_PASSWORD
                },
                isLength: {
                    options: [{min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH}],
                    errorMessage: LENGTH_REQUIRED('Password', {min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH})
                }
            }
        }
    },
    signUp: {
        validation: {
            'name': {
                in: 'body',
                notEmpty: {
                    errorMessage: REQUIRED('Name')
                },
                isAlphanumeric: {
                    errorMessage: ONLY_ALPHA_NUMERIC('Name')
                },
                isLength: {
                    options: [{min: MIN_LENGTH, max: NAME_MAX_LENGTH}],
                    errorMessage: LENGTH_REQUIRED('Name', {max: NAME_MAX_LENGTH})
                }
            },
            'email': {
                in: 'body',
                isEmail: {
                    errorMessage: INVALID_EMAIL
                },
                notEmpty: {
                    errorMessage: REQUIRED('Email')
                },
                isLength: {
                    options: [{min: MIN_LENGTH, max: EMAIL_MAX_LENGTH}],
                    errorMessage: LENGTH_REQUIRED('Email', {max: EMAIL_MAX_LENGTH})
                }
            },
            'password': {
                in: 'body',
                notEmpty: {
                    errorMessage: REQUIRED('Password')
                },
                matches: {
                    options: [/^(?=.*?[a-zA-Z])(?=.*?[0-9])[\w@#$%^?~-]{0,128}$/],
                    errorMessage: INVALID_PASSWORD
                },
                isLength: {
                    options: [{min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH}],
                    errorMessage: LENGTH_REQUIRED('Password', {min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH})
                }
            }
        }
    }
 }
