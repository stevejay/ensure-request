'use strict';

var traverseConstraint = require('./src/traverse-constraint');
var constraints = require('./src/constraints');
var util = require('./src/util');

var ensure = function ensure(params, constraints, errorHandler) {
    var result = {};
    traverseConstraint('', params, constraints, result);
    var hasErrors = util.getKeys(result).length > 0;

    if (!errorHandler) {
        return hasErrors ? result : null;
    } else if (hasErrors) {
        var errors = [];

        util.getKeys(result).forEach(function (key) {
            return result[key].forEach(function (error) {
                return errors.push(error);
            });
        });

        return errorHandler(errors);
    }
};

module.exports = exports = { ensure: ensure, constraints: constraints };