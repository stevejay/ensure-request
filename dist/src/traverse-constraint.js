'use strict';

var startCase = require('lodash.startcase');
var constraints = require('./constraints');
var util = require('./util');

var EACH_CONSTRAINT_NAME = 'each';
var NESTED_OBJECT_CONSTRAINT_NAME = 'object';
var DEPENDENCY_CONSTRAINT_NAME = 'dependency';

function _testConstraint(constraintName, constraintOptions, propertyValue, propertyName) {
    var constraint = constraints[constraintName];

    if (!constraint) {
        throw new Error('Unknown constraint \'' + constraintName + '\' specified');
    }

    var errorMessage = constraint(propertyValue, constraintOptions);

    if (errorMessage) {
        errorMessage = errorMessage.replace(/\[var\]/, startCase(propertyName));
        return errorMessage.trim();
    }

    return null;
}

function _addErrorToResult(result, propertyPath, errorMessage) {
    if (!errorMessage) {
        return;
    }

    if (!result[propertyPath]) {
        result[propertyPath] = [];
    }

    result[propertyPath].push(errorMessage);
}

function _handleNestedObject(params, propertyPath, propertyName, constraintOptions, result) {
    var value = params[propertyName];

    if (util.isObject(value) && !util.isArray(value)) {
        traverseConstraint(propertyPath, value, constraintOptions, // these are the subconstraints
        result);
    } else if (util.isDefined(value)) {
        var errorMessage = startCase(propertyName) + ' is not an object';
        _addErrorToResult(result, propertyPath, errorMessage);
    }
}

function _handleDependency(params, propertyPath, propertyName, constraintOptions, result) {
    var value = params[propertyName];

    var dependencies = constraintOptions.length ? constraintOptions : [constraintOptions];

    for (var i = 0; i < dependencies.length; ++i) {
        var dependency = dependencies[i];

        if (!dependency.test || dependency.test(value, params)) {
            if (!dependency.ensure(value, params)) {
                var errorMessage = dependency.message || startCase(propertyName) + ' dependency error';

                _addErrorToResult(result, propertyPath, errorMessage);

                break;
            }
        }
    }
}

function _handleArray(params, propertyPath, propertyName, constraintOptions, result) {
    var arrayValues = params[propertyName];
    var namesOfConstraints = util.getKeys(constraintOptions);

    if (util.isArray(arrayValues)) {
        if (namesOfConstraints.indexOf(NESTED_OBJECT_CONSTRAINT_NAME) > -1) {
            for (var i = 0; i < arrayValues.length; ++i) {
                traverseConstraint(propertyPath + '[' + i + ']', arrayValues[i], constraintOptions[NESTED_OBJECT_CONSTRAINT_NAME], result);
            }
        } else {
            for (var _i = 0; _i < arrayValues.length; ++_i) {
                for (var j = 0; j < namesOfConstraints.length; ++j) {
                    var errorMessage = _testConstraint(namesOfConstraints[j], constraintOptions[namesOfConstraints[j]], arrayValues[_i], propertyName + '[' + _i + ']');

                    _addErrorToResult(result, propertyPath + '[' + _i + ']', errorMessage);
                }
            }
        }
    } else if (util.isDefined(arrayValues)) {
        _addErrorToResult(result, propertyPath, startCase(propertyName) + ' is not an array');
    }
}

function traverseConstraint(parentPropertyPath, params, constraint, result) {
    // Loop through the names of all the properties to ensure at this recursion level.
    util.getKeys(constraint).forEach(function (propertyName) {
        // Loop through all the constraints to apply to the property.
        util.getKeys(constraint[propertyName]).forEach(function (constraintName) {
            var options = constraint[propertyName][constraintName];
            var propertyPath = '' + parentPropertyPath + (parentPropertyPath ? '.' : '') + propertyName;

            if (constraintName === EACH_CONSTRAINT_NAME) {
                _handleArray(params, propertyPath, propertyName, options, result);
            } else if (constraintName === NESTED_OBJECT_CONSTRAINT_NAME) {
                _handleNestedObject(params, propertyPath, propertyName, options, result);
            } else if (constraintName === DEPENDENCY_CONSTRAINT_NAME) {
                _handleDependency(params, propertyPath, propertyName, options, result);
            } else {
                var errorMessage = _testConstraint(constraintName, options, params[propertyName], propertyName);

                _addErrorToResult(result, propertyPath, errorMessage);
            }
        });
    });
}

module.exports = exports = traverseConstraint;