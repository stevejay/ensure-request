'use strict';

const startCase = require('lodash.startcase'); 
const constraints = require('./constraints');
const util = require('./util');

const EACH_CONSTRAINT_NAME = 'each';
const NESTED_OBJECT_CONSTRAINT_NAME = 'object';
const DEPENDENCY_CONSTRAINT_NAME = 'dependency';

function _testConstraint(constraintName, constraintOptions, propertyValue, propertyName) {
    const constraint = constraints[constraintName];

    if (!constraint) {
        throw new Error('Unknown constraint \'' + constraintName + '\' specified');
    }

    let errorMessage = constraint(propertyValue, constraintOptions);

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
    const value = params[propertyName];

    if (util.isObject(value) && !util.isArray(value)) {
        traverseConstraint(
            propertyPath,
            value,
            constraintOptions, // these are the subconstraints
            result);
    } else if (util.isDefined(value)) {
        const errorMessage = startCase(propertyName) + ' is not an object';
        _addErrorToResult(result, propertyPath, errorMessage);
    }
}

function _handleDependency(params, propertyPath, propertyName, constraintOptions, result) {
    const value = params[propertyName];

    const dependencies = constraintOptions.length ?
        constraintOptions : [constraintOptions];

    for (let i = 0; i < dependencies.length; ++i) {
        const dependency = dependencies[i];

        if (!dependency.test || dependency.test(value, params)) {
            if (!dependency.ensure(value, params)) {
                const errorMessage =
                    dependency.message ||
                    startCase(propertyName) + ' dependency error';

                _addErrorToResult(result, propertyPath, errorMessage);

                break;
            }
        }
    }
}

function _handleArray(params, propertyPath, propertyName, constraintOptions, result) {
    const arrayValues = params[propertyName];
    const namesOfConstraints = util.getKeys(constraintOptions);

    if (util.isArray(arrayValues)) {
        if (namesOfConstraints.indexOf(NESTED_OBJECT_CONSTRAINT_NAME) > -1) {
            for (let i = 0; i < arrayValues.length; ++i) {
                traverseConstraint(
                    `${propertyPath}[${i}]`,
                    arrayValues[i],
                    constraintOptions[NESTED_OBJECT_CONSTRAINT_NAME],
                    result);
            }
        } else {
            for (let i = 0; i < arrayValues.length; ++i) {
                for (let j = 0; j < namesOfConstraints.length; ++j) {
                    const errorMessage = _testConstraint(
                        namesOfConstraints[j],
                        constraintOptions[namesOfConstraints[j]],
                        arrayValues[i],
                        `${propertyName}[${i}]`);

                    _addErrorToResult(
                        result,
                        `${propertyPath}[${i}]`,
                        errorMessage);
                }
            }
        }
    } else if (util.isDefined(arrayValues)) {
        _addErrorToResult(
            result,
            propertyPath,
            startCase(propertyName) + ' is not an array');
    }
}

function traverseConstraint(parentPropertyPath, params, constraint, result) {
    // Loop through the names of all the properties to ensure at this recursion level.
    util.getKeys(constraint).forEach(propertyName => {
        // Loop through all the constraints to apply to the property.
        util.getKeys(constraint[propertyName]).forEach(constraintName => {
            const options = constraint[propertyName][constraintName];
            const propertyPath = `${parentPropertyPath}${parentPropertyPath ? '.' : ''}${propertyName}`;

            if (constraintName === EACH_CONSTRAINT_NAME) {
                _handleArray(params, propertyPath, propertyName, options, result);
            } else if (constraintName === NESTED_OBJECT_CONSTRAINT_NAME) {
                _handleNestedObject(params, propertyPath, propertyName, options, result);
            } else if (constraintName === DEPENDENCY_CONSTRAINT_NAME) {
                _handleDependency(params, propertyPath, propertyName, options, result);
            } else {
                const errorMessage = _testConstraint(
                    constraintName,
                    options,
                    params[propertyName],
                    propertyName);

                _addErrorToResult(result, propertyPath, errorMessage);
            }
        });
    });
}

module.exports = exports = traverseConstraint;
