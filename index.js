'use strict';

const ensure = (params, constraints, returnErrors) => {
    const result = [];
    walkConstraints('', params, constraints, result);

    if (returnErrors) {
        return result.length ? result : null;
    }

    if (result.length) {
        throw new Error('[400] ' + result.join('; '));
    }
};

const PRIMITIVE_VALUE_FLAG = '_value';

const walkConstraints = (parentPath, param, constraints, result) => {
    const namesOfPropertiesToCheck = Object.keys(constraints);

    if (namesOfPropertiesToCheck.indexOf(PRIMITIVE_VALUE_FLAG) > -1) {
        // We're checking a primitive value, not the property of an object.

        const namesOfConstraintsToApply = Object.keys(constraints[PRIMITIVE_VALUE_FLAG]);

        namesOfConstraintsToApply.forEach(nameOfConstraint => {
            const constraintOptions = constraints[PRIMITIVE_VALUE_FLAG][nameOfConstraint];
            
            const errorMessage = testConstraint(
                nameOfConstraint, constraintOptions, param, '');

            if (errorMessage) {
                result.push(`${parentPath} ${errorMessage}`);
            }
        });
    } else {
        namesOfPropertiesToCheck.forEach(nameOfPropertyToCheck => {
            const namesOfConstraintsToApply = Object.keys(constraints[nameOfPropertyToCheck]);

            // apply each constraint to the property to check
            namesOfConstraintsToApply.forEach(nameOfConstraint => {
                const constraintOptions = constraints[nameOfPropertyToCheck][nameOfConstraint];
                const propertyPath = `${parentPath}${parentPath ? '.' : ''}${nameOfPropertyToCheck}`;

                if (nameOfConstraint === 'each') {
                    const arrayValues = param[nameOfPropertyToCheck];

                    if (isArray(arrayValues)) {
                        for (var i = 0; i < arrayValues.length; ++i) {
                            walkConstraints(
                                `${propertyPath}[${i}]`,
                                arrayValues[i],
                                constraintOptions, // these are the subconstraints
                                result);
                        }
                    } else if (isDefined(arrayValues)) {
                        result.push(`${propertyPath} is not an array`);
                    }
                } else if (nameOfConstraint === 'object') {
                    const value = param[nameOfPropertyToCheck];

                    if (isObject(value) && !isArray(value)) {
                        walkConstraints(
                            propertyPath,
                            value,
                            constraintOptions, // these are the subconstraints
                            result);
                    } else if (isDefined(value)) {
                        result.push(propertyPath + ' is not an object');
                    }
                } else if (nameOfConstraint === 'dependency') {
                    const value = param[nameOfPropertyToCheck];
                    const attrs = param;

                    const dependencies = constraintOptions.length ?
                        constraintOptions : [constraintOptions];

                    for (let i = 0; i < dependencies.length; ++i) {
                        const dependency = dependencies[i];

                        if (!dependency.test || dependency.test(value)) {
                            if (!dependency.ensure(attrs, value)) {
                                result.push(`${propertyPath} dependency error${dependency.message ? ': ' : ''}${dependency.message || ''}`);
                                break;
                            }
                        }
                    }
                } else {
                    const value = param[nameOfPropertyToCheck];

                    const errorMessage = testConstraint(
                        nameOfConstraint, constraintOptions, value, nameOfPropertyToCheck);

                    if (errorMessage) {
                        result.push(`${parentPath}${parentPath ? '.' : ''}${errorMessage}`);
                    }
                }
            });
        });
    }
};

function testConstraint(name, options, value, valueName) {
    const constraint = validators[name];

    if (!constraint) {
        throw new Error('Unknown constraint \'' + name + '\' specified');
    }

    let errorMessage = constraint(value, options);

    if (errorMessage) {
        errorMessage = errorMessage.replace(/\[var\]/, valueName);
        return errorMessage.trim();
    }

    return null;
}

function isDefined(value) {
    return value !== null && value !== undefined;
}

function isObject(value) {
    return value === Object(value);
}

function isArray(value) {
    return {}.toString.call(value) === '[object Array]';
}

function isString(value) {
    return typeof value === 'string';
}

function isDate(value) {
    return value instanceof Date;
}

function isRegExp(value) {
    return value instanceof RegExp;
}

function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}

function testFormat(pattern, flags, value) {
    const regex = isRegExp(pattern) ? pattern : new RegExp('^' + pattern + '$', flags);
    return regex.test(value);
}

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i;

// source: https://gist.github.com/dperini/729294
const URL_REGEX = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

const UUID_REGEX = /^[a-f0-9]{32}$/;

const validators = {
    string: (value, options) => (
        !options || !isDefined(value) || isString(value) ? null : options.message || '[var] is not a string'
    ),
    number: (value, options) => (
        !options || !isDefined(value) || isNumber(value) ? null : options.message || '[var] is not a number'
    ),
    presence: (value, options) => (
        !options || isDefined(value) ? null : options.message || '[var] can\'t be blank'
    ),
    inclusion: (value, options) => (
        !options || !isDefined(value) || (options.within || options || []).indexOf(value) > -1 ?
            null :
            options.message || '[var] is not included in the list'
    ),
    format: (value, options) => {
        if (!options || !isDefined(value)) { return null; }
        return testFormat(options.pattern || options, options.flags, value) ? null : options.message || '[var] is in wrong format';
    },
    array: (value, options) => (
        !options || !isDefined(value) || isArray(value) ? null : options.message || '[var] is not an array'
    ),
    date: (value, options) => (
        !options || !isDefined(value) || isDate(value) ? null : options.message || '[var] is not an instance of Date'
    ),
    uuid: (value, options) => (
        !options || !isDefined(value) || UUID_REGEX.test(value) ? null : options.message || '[var] is not a UUID'
    ),
    bool: (value, options) => (
        !options || !isDefined(value) || typeof value === 'boolean' ? null : options.message || '[var] is not boolean'
    ),
    email: (value, options) => (
        !options || !isDefined(value) || EMAIL_REGEX.test(value) ?
            null :
            options.message || '[var] is not a valid email'
    ),
    url: (value, options) => (
        !options || !isDefined(value) || URL_REGEX.test(value) ?
            null :
            options.message || '[var] is not a valid url'
    ),
    length: (value, options) => {
        if (!options || !isDefined(value)) { return null; }

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
        if (!options || !isDefined(value) || !isNumber(value)) {
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
        } else if (options.hasOwnProperty('pattern') && !testFormat(options.pattern, options.flags, value)) {
            return options.message || options.wrongFormat || '[var] has wrong format';
        }

        return null;
    },
    ordered: (value, options) => {
        if (!options || !isDefined(value) || !isArray(value) || value.length <= 1) {
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

module.exports = {
    ensure: ensure,
    validators: validators
};
