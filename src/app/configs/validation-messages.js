export const MUST_BE_NUMBER = resource => `${resource} must be valid number greater 0!`;

export const MUST_BE_BOOLEAN = resource => `${resource} must be boolean!`;

export const MUST_BE_URL = resource => `${resource} must be valid url!`;

export const REQUIRED = resource => `${resource} is required!`;

export const LENGTH_REQUIRED = (resource, options) => {
    const { min, max } = options;
    if (min && max) {
        return `${resource} must be at least ${min} and maximum ${max} characters!`;
    } else if (min) {
        return `${resource} must be at least ${min} characters!`;
    } else {
        return `${resource} must be maximum ${max} characters!`;
    }
};

export const INVALID_EMAIL = 'Email is invalid';

export const ONLY_ALPHA_NUMERIC = resource => `${resource} must contain only alphabetic and numeric characters!`;

export const MUST_BE_IN = (resource, options) => `${resource} must be one of this options '${options.join(', ')}'!`;

export const MISSING = (resource, place) => `Missing ${resource} in ${place}!`;

export const INVALID_PASSWORD = 'Password must contain at least one character and one number!';

export const MUST_BE_UNIQUE = (resource, property) => `There is already ${resource} with this ${property}!`;

export const INVALID_LINK = 'You supplied invalid link.';
