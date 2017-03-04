'use strict';

const traverseConstraint = require('./src/traverse-constraint');
const constraints = require('./src/constraints');
const util = require('./src/util');

const ensure = function(params, constraints, errorHandler) {
    const result = {};
    traverseConstraint('', params, constraints, result);
    const hasErrors = util.getKeys(result).length > 0;

    if (!errorHandler) {
        return hasErrors ? result : null;
    } else if (hasErrors) {
        const errors = [];

        util.getKeys(result)
            .forEach(key => result[key].forEach(error => errors.push(error)));

        return errorHandler(errors);
    }
};

module.exports = exports = { ensure, constraints };
