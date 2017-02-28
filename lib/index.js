'use strict';

var startCase = require('lodash.startcase');

var ensure = function ensure(params, constraints, returnErrors) {
    var result = {};

    walkConstraints('', params, constraints, result);

    var hasErrors = Object.keys(result).length > 0;

    if (returnErrors) {
        return hasErrors ? result : null;
    } else if (hasErrors) {
        var errors = [];

        Object.keys(result).forEach(function (key) {
            return result[key].forEach(function (error) {
                return errors.push(error);
            });
        });

        throw new Error('[400] ' + errors.join('; '));
    }
};

var walkConstraints = function walkConstraints(parentPath, param, constraints, result) {
    var namesOfPropertiesToCheck = Object.keys(constraints);

    namesOfPropertiesToCheck.forEach(function (nameOfPropertyToCheck) {
        var namesOfConstraintsToApply = Object.keys(constraints[nameOfPropertyToCheck]);

        // apply each constraint to the property to check
        namesOfConstraintsToApply.forEach(function (nameOfConstraint) {
            var constraintOptions = constraints[nameOfPropertyToCheck][nameOfConstraint];
            var propertyPath = '' + parentPath + (parentPath ? '.' : '') + nameOfPropertyToCheck;
            var i, j;

            if (nameOfConstraint === 'each') {
                var arrayValues = param[nameOfPropertyToCheck];

                var namesOfConstraints = Object.keys(constraintOptions);

                if (isArray(arrayValues)) {
                    if (namesOfConstraints.indexOf('object') > -1) {
                        for (i = 0; i < arrayValues.length; ++i) {
                            walkConstraints(propertyPath + '[' + i + ']', arrayValues[i], constraintOptions.object, result);
                        }
                    } else {
                        for (i = 0; i < arrayValues.length; ++i) {
                            for (j = 0; j < namesOfConstraints.length; ++j) {
                                var errorMessage = testConstraint(namesOfConstraints[j], constraintOptions[namesOfConstraints[j]], arrayValues[i], nameOfPropertyToCheck + '[' + i + ']');

                                if (errorMessage) {
                                    addErrorToResult(result, propertyPath + '[' + i + ']', errorMessage);
                                }
                            }
                        }
                    }
                } else if (isDefined(arrayValues)) {
                    addErrorToResult(result, propertyPath, startCase(nameOfPropertyToCheck) + ' is not an array');
                }
            } else if (nameOfConstraint === 'object') {
                var value = param[nameOfPropertyToCheck];

                if (isObject(value) && !isArray(value)) {
                    walkConstraints(propertyPath, value, constraintOptions, // these are the subconstraints
                    result);
                } else if (isDefined(value)) {
                    addErrorToResult(result, propertyPath, startCase(nameOfPropertyToCheck) + ' is not an object');
                }
            } else if (nameOfConstraint === 'dependency') {
                var _value = param[nameOfPropertyToCheck];
                var attrs = param;

                var dependencies = constraintOptions.length ? constraintOptions : [constraintOptions];

                for (var _i = 0; _i < dependencies.length; ++_i) {
                    var dependency = dependencies[_i];

                    if (!dependency.test || dependency.test(_value, attrs)) {
                        if (!dependency.ensure(_value, attrs)) {
                            var message = dependency.message || startCase(nameOfPropertyToCheck) + ' dependency error';

                            addErrorToResult(result, propertyPath, message);
                            break;
                        }
                    }
                }
            } else {
                var _value2 = param[nameOfPropertyToCheck];

                var _errorMessage = testConstraint(nameOfConstraint, constraintOptions, _value2, nameOfPropertyToCheck);

                if (_errorMessage) {
                    addErrorToResult(result, '' + parentPath + (parentPath ? '.' : '') + nameOfPropertyToCheck, _errorMessage);
                }
            }
        });
    });
};

function addErrorToResult(result, path, message) {
    if (!result[path]) {
        result[path] = [];
    }

    result[path].push(message);
}

function testConstraint(name, options, value, valueName) {
    var constraint = validators[name];

    if (!constraint) {
        throw new Error('Unknown constraint \'' + name + '\' specified');
    }

    var errorMessage = constraint(value, options);

    if (errorMessage) {
        errorMessage = errorMessage.replace(/\[var\]/, startCase(valueName));
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
    var regex = isRegExp(pattern) ? pattern : new RegExp('^' + pattern + '$', flags);
    return regex.test(value);
}

var EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i;

// source: https://gist.github.com/dperini/729294
var URL_REGEX = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

var UUID_REGEX = /^[a-f0-9]{32}$/;

var validators = {
    string: function string(value, options) {
        return !options || !isDefined(value) || isString(value) ? null : options.message || '[var] is not a string';
    },
    number: function number(value, options) {
        return !options || !isDefined(value) || isNumber(value) ? null : options.message || '[var] is not a number';
    },
    presence: function presence(value, options) {
        if (!options) {
            return null;
        }

        if (options.disallowEmpty && (value === '' || isArray(value) && value.length === 0) || !isDefined(value)) {
            return options.message || '[var] can\'t be blank';
        }
    },
    inclusion: function inclusion(value, options) {
        return !options || !isDefined(value) || (options.within || options || []).indexOf(value) > -1 ? null : options.message || '[var] is not included in the list';
    },
    format: function format(value, options) {
        if (!options || !isDefined(value)) {
            return null;
        }
        return testFormat(options.pattern || options, options.flags, value) ? null : options.message || '[var] is in the wrong format';
    },
    array: function array(value, options) {
        return !options || !isDefined(value) || isArray(value) ? null : options.message || '[var] is not an array';
    },
    date: function date(value, options) {
        return !options || !isDefined(value) || isDate(value) ? null : options.message || '[var] is not an instance of Date';
    },
    uuid: function uuid(value, options) {
        return !options || !isDefined(value) || UUID_REGEX.test(value) ? null : options.message || '[var] is not a UUID';
    },
    bool: function bool(value, options) {
        return !options || !isDefined(value) || typeof value === 'boolean' ? null : options.message || '[var] is not boolean';
    },
    email: function email(value, options) {
        return !options || !isDefined(value) || EMAIL_REGEX.test(value) ? null : options.message || '[var] is not a valid email';
    },
    url: function url(value, options) {
        return !options || !isDefined(value) || URL_REGEX.test(value) ? null : options.message || '[var] is not a valid url';
    },
    length: function length(value, options) {
        if (!options || !isDefined(value)) {
            return null;
        }

        value = typeof value === 'string' ? new String(value) : value; // jshint ignore:line

        if (options.hasOwnProperty('minimum') && value.length < options.minimum) {
            return options.message || options.tooShort || '[var] is too short (minimum length is ' + options.minimum + ')';
        } else if (options.hasOwnProperty('maximum') && value.length > options.maximum) {
            return options.message || options.tooLong || '[var] is too long (maximum length is ' + options.maximum + ')';
        } else if (options.hasOwnProperty('exactly') && value.length !== options.exactly) {
            return options.message || options.wrongLength || '[var] has length that is not exactly ' + options.exactly;
        }

        return null;
    },
    numericality: function numericality(value, options) {
        if (!options || !isDefined(value) || !isNumber(value)) {
            return null;
        }

        if (options.hasOwnProperty('onlyInteger') && value % 1 !== 0) {
            return options.message || options.notAnInteger || '[var] is not an integer';
        } else if (options.hasOwnProperty('greaterThan') && value <= options.greaterThan) {
            return options.message || options.notGreaterThan || '[var] is not greater than ' + options.greaterThan;
        } else if (options.hasOwnProperty('greaterThanOrEqualTo') && value < options.greaterThanOrEqualTo) {
            return options.message || options.notGreaterThanOrEqualTo || '[var] is not greater than or equal to ' + options.greaterThanOrEqualTo;
        } else if (options.hasOwnProperty('lessThan') && value >= options.lessThan) {
            return options.message || options.notLessThan || '[var] is not less than ' + options.lessThan;
        } else if (options.hasOwnProperty('lessThanOrEqualTo') && value > options.lessThanOrEqualTo) {
            return options.message || options.notLessThanOrEqualTo || '[var] is not less than or equal to ' + options.lessThanOrEqualTo;
        } else if (options.hasOwnProperty('pattern') && !testFormat(options.pattern, options.flags, value)) {
            return options.message || options.wrongFormat || '[var] has wrong format';
        }

        return null;
    },
    ordered: function ordered(value, options) {
        if (!options || !isDefined(value) || !isArray(value) || value.length <= 1) {
            return null;
        }

        var comparator = options.comparator || options;

        for (var i = 0; i < value.length - 1; ++i) {
            if (!comparator(value[i], value[i + 1])) {
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