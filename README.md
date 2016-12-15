# ensure-request

Validation for API requests

[![npm version](https://badge.fury.io/js/ensure-request.svg)](https://badge.fury.io/js/ensure-request)

[![Coverage Status](https://coveralls.io/repos/github/stevejay/ensure-request/badge.svg?branch=master)](https://coveralls.io/github/stevejay/ensure-request?branch=master)
[![dependency status](https://david-dm.org/stevejay/ensure-request.svg)](https://david-dm.org/stevejay/ensure-request)

## Install

```
$ npm install --save ensure-request
```

## Usage

```js
const ensure = require('ensure-request');

const constraint = {
    name: {
        presence: true,
        string: true
    }
};

const request = {
    name: 123
};

ensure(request, constraint); // throws an Error exception on name
```

## API

### ensure(object, constraint)

Validates `object` according to the `constraint` object,
throwing an `Error` exception if validation fails.

#### object

Type: `Object`

The object to validate.

#### constraint

Type: `Object`

The constraint object that specifies the constraints to apply to the object.

## License

MIT

## Acknowledgements

This package was heavily influenced by the package [Validate.js](https://validatejs.org/).
This package takes a different approach to how it walks nested objects and arrays,
and how constraints are specified for them both.
