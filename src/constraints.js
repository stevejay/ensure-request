'use strict';

const util = require('./util');

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i;

// source: https://gist.github.com/dperini/729294
const URL_REGEX = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

const UUID_REGEX = /^[a-f0-9]{32}$/;

function _testFormat(pattern, flags, value) {
    const regex = util.isRegExp(pattern) ? pattern : new RegExp('^' + pattern + '$', flags);
    return regex.test(value);
}

module.exports = exports = {
    string: (value, options) => (
        !options || !util.isDefined(value) || util.isString(value) ? null : options.message || '[var] is not a string'
    ),
    number: (value, options) => (
        !options || !util.isDefined(value) || util.isNumber(value) ? null : options.message || '[var] is not a number'
    ),
    presence: (value, options) => {
        if (!options) {
            return null;
        }

        if ((options.disallowEmpty &&
            (value === '' || (util.isArray(value) && value.length === 0))) ||
            !util.isDefined(value)) {
            return options.message || '[var] can\'t be blank';
        }
    },
    inclusion: (value, options) => (
        !options || !util.isDefined(value) || (options.within || options || []).indexOf(value) > -1 ?
            null :
            options.message || '[var] is not included in the list'
    ),
    format: (value, options) => {
        if (!options || !util.isDefined(value)) { return null; }
        return _testFormat(options.pattern || options, options.flags, value) ? null : options.message || '[var] is in the wrong format';
    },
    array: (value, options) => (
        !options || !util.isDefined(value) || util.isArray(value) ? null : options.message || '[var] is not an array'
    ),
    date: (value, options) => (
        !options || !util.isDefined(value) || util.isDate(value) ? null : options.message || '[var] is not an instance of Date'
    ),
    uuid: (value, options) => (
        !options || !util.isDefined(value) || UUID_REGEX.test(value) ? null : options.message || '[var] is not a UUID'
    ),
    bool: (value, options) => (
        !options || !util.isDefined(value) || typeof value === 'boolean' ? null : options.message || '[var] is not boolean'
    ),
    email: (value, options) => (
        !options || !util.isDefined(value) || EMAIL_REGEX.test(value) ?
            null :
            options.message || '[var] is not a valid email'
    ),
    url: (value, options) => (
        !options || !util.isDefined(value) || URL_REGEX.test(value) ?
            null :
            options.message || '[var] is not a valid url'
    ),
    length: (value, options) => {
        if (!options || !util.isDefined(value)) { return null; }

        value = typeof value === 'string' ? new String(value) : value; // jshint ignore:line

        if (options.hasOwnProperty('minimum') && value.length < options.minimum) {
            return options.message || options.tooShort || `[var] is too short (minimum length is ${options.minimum})`;
        } else if (options.hasOwnProperty('maximum') && value.length > options.maximum) {
            return options.message || options.tooLong || `[var] is too long (maximum length is ${options.maximum})`;
        } else if (options.hasOwnProperty('exactly') && value.length !== options.exactly) {
            return options.message || options.wrongLength || `[var] has length that is not exactly ${options.exactly}`;
        }

        return null;
    },
    numericality: (value, options) => {
        if (!options || !util.isDefined(value) || !util.isNumber(value)) {
            return null;
        }

        if (options.hasOwnProperty('onlyInteger') && value % 1 !== 0) {
            return options.message || options.notAnInteger || '[var] is not an integer';
        } else if (options.hasOwnProperty('greaterThan') && value <= options.greaterThan) {
            return options.message || options.notGreaterThan || `[var] is not greater than ${options.greaterThan}`;
        } else if (options.hasOwnProperty('greaterThanOrEqualTo') && value < options.greaterThanOrEqualTo) {
            return options.message || options.notGreaterThanOrEqualTo || `[var] is not greater than or equal to ${options.greaterThanOrEqualTo}`;
        } else if (options.hasOwnProperty('lessThan') && value >= options.lessThan) {
            return options.message || options.notLessThan || `[var] is not less than ${options.lessThan}`;
        } else if (options.hasOwnProperty('lessThanOrEqualTo') && value > options.lessThanOrEqualTo) {
            return options.message || options.notLessThanOrEqualTo || `[var] is not less than or equal to ${options.lessThanOrEqualTo}`;
        } else if (options.hasOwnProperty('pattern') && !_testFormat(options.pattern, options.flags, value)) {
            return options.message || options.wrongFormat || '[var] has wrong format';
        }

        return null;
    },
    ordered: (value, options) => {
        if (!options || !util.isDefined(value) || !util.isArray(value) || value.length <= 1) {
            return null;
        }

        const comparator = options.comparator || options;

        for (var i = 0; i < (value.length - 1); ++i) {
            if (!comparator(value[i], value[i+1])) {
                return options.message || '[var] is not ordered';
            }
        }

        return null;
    }
};
