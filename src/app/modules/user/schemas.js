import {
    EMAIL_MAX_LENGTH, MIN_LENGTH, NAME_MAX_LENGTH
} from '../../configs/constants';
import {
    INVALID_EMAIL, LENGTH_REQUIRED, ONLY_ALPHA_NUMERIC,
    REQUIRED
} from '../../configs/validation-messages';

export default {
    getUser: {
        validation: {
            'name': {
                in: 'body',
                notEmpty: {
                    errorMessage: REQUIRED('Name')
                },
                isAlphanumeric: {
                    errorMessage: ONLY_ALPHA_NUMERIC("Name")
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
            }
        },
        authentication: true
    }
}