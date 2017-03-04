'use strict';

module.exports.getKeys = function (obj) {
    return Object.keys(obj);
};

module.exports.isObject = function (value) {
    return value === Object(value);
};

module.exports.isArray = function (value) {
    return {}.toString.call(value) === '[object Array]';
};

module.exports.isDefined = function (value) {
    return value !== null && value !== undefined;
};

module.exports.isString = function (value) {
    return typeof value === 'string';
};

module.exports.isDate = function (value) {
    return value instanceof Date;
};

module.exports.isRegExp = function (value) {
    return value instanceof RegExp;
};

module.exports.isNumber = function (value) {
    return typeof value === 'number' && !isNaN(value);
};