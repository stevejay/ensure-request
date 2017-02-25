'use strict';

const expect = require('chai').expect;
const ensure = require('../index.js').ensure;

describe('ensure', function() {
    describe('test not passing an object to object function', function() {
        const tests = [
            {
                params: {
                    a: {
                        b: 3
                    }
                },
                constraints: {
                    a: {
                        object: {
                            b: {
                                object: {
                                    c: { string: true }
                                }
                            }
                        }
                    }
                },
                expected: { 'a.b': ['B is not an object'] }
            },
            {
                params: {
                    a: {
                        b: null
                    }
                },
                constraints: {
                    a: {
                        object: {
                            b: {
                                object: {
                                    c: { string: true }
                                }
                            }
                        }
                    }
                },
                expected: null
            },
            {
                params: {
                    a: {
                        b: null
                    }
                },
                constraints: {
                    a: {
                        object: {
                            b: {
                                presence: true,
                                object: {
                                    c: { string: true }
                                }
                            }
                        }
                    }
                },
                expected: { 'a.b': ['B can\'t be blank'] }
            },
            {
                params: {
                    a: null
                },
                constraints: {
                    a: {
                        object: {
                            b: {
                                object: {
                                    c: { string: true }
                                }
                            }
                        }
                    }
                },
                expected: null
            },
            {
                params: {
                    a: {
                        b: undefined
                    }
                },
                constraints: {
                    a: {
                        object: {
                            b: {
                                object: {
                                    c: { string: true }
                                }
                            }
                        }
                    }
                },
                expected: null
            },
            {
                params: {
                    a: {
                        b: []
                    }
                },
                constraints: {
                    a: {
                        object: {
                            b: {
                                object: {
                                    c: { string: true }
                                }
                            }
                        }
                    }
                },
                expected: { 'a.b': ['B is not an object'] }
            }
        ];

        runTests(tests);
    });

    describe('test not passing an object to the each function', function() {
        const tests = [
            {
                params: {
                    a: {
                        b: 3
                    }
                },
                constraints: {
                    a: {
                        object: {
                            b: {
                                each: {
                                    object: {
                                        c: { string: true }
                                    }
                                }
                            }
                        }
                    }
                },
                expected: { 'a.b': ['B is not an array']}
            },
            {
                params: {
                    a: {
                        b: null
                    }
                },
                constraints: {
                    a: {
                        object: {
                            b: {
                                each: {
                                    object: {
                                        c: { string: true }
                                    }
                                }
                            }
                        }
                    }
                },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('test deep paths on objects', function() {
        const tests = [
            {
                params: { a: 1 },
                constraints: { a: { string: true } },
                expected: { a: ['A is not a string'] }
            },
            {
                params: {
                    a: {
                        b: {
                            c: 1
                        }
                    }
                },
                constraints: {
                    a: {
                        object: {
                            b: {
                                object: {
                                    c: { string: true }
                                }
                            }
                        }
                    }
                },
                expected: { 'a.b.c': ['C is not a string'] }
            }
        ];

        runTests(tests);
    });

    describe('test deep arrays of objects', function() {
        const tests = [
            {
                params: { a: [{ b: 999 }] },
                constraints: {
                    a: {
                        each: {
                            object: {
                                b: { string: true }
                            }
                        }
                    }
                },
                expected: { 'a[0].b': ['B is not a string'] }
            }, {
                params: { a: [{ b: [{ c: 'string' }, { c: 999 }] }] },
                constraints: {
                    a: {
                        each: {
                            object: {
                                b: {
                                    each: {
                                        object: {
                                            c: { string: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                expected: { 'a[0].b[1].c': ['C is not a string'] }
            }
        ];

        runTests(tests);
    });

    describe('test deep arrays of values', function() {
        const tests = [
            {
                params: {
                    a: [
                        { b: ['string', {}] }
                    ]
                },
                constraints: {
                    a: {
                        each: {
                            object: {
                                b: {
                                    each: { string: true }
                                }
                            }
                        }
                    }
                },
                expected: { 'a[0].b[1]': ['B 1 is not a string'] }
            },
            {
                params: { a: [ 1 ] },
                constraints: {
                    a: {
                        each: { string: true }
                    }
                },
                expected: { 'a[0]': ['A 0 is not a string'] }
            },
            {
                params: { a: [ 'Director' ] },
                constraints: {
                    a: {
                        each: { format: /^\w.+\w$/ }
                    }
                },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('test failure to find property', function() {
        const tests = [
            {
                params: { b: { } },
                constraints: { a: { presence: true, string: true } },
                expected: { 'a': ['A can\'t be blank'] }
            }
        ];

        runTests(tests);
    });

    describe('string', function() {
        const tests = [
            {
                params: { someVar: 'hello ' },
                constraints: { someVar: { string: true } },
                expected: null
            }, {
                params: { someVar: '' },
                constraints: { someVar: { string: true } },
                expected: null
            }, {
                params: { someVar: null },
                constraints: { someVar: { string: true } },
                expected: null
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { string: true } },
                expected: null
            }, {
                params: { someVar: 789 },
                constraints: { someVar: { string: true } },
                expected: { someVar: ['Some Var is not a string'] }
            }, {
                params: { someVar: 789 },
                constraints: { someVar: { string: false } },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('presence', function() {
        const tests = [
            {
                params: { someVar: 'hello ' },
                constraints: { someVar: { presence: true } },
                expected: null
            }, {
                params: { someVar: 789 },
                constraints: { someVar: { presence: true } },
                expected: null
            }, {
                params: { someVar: '' },
                constraints: { someVar: { presence: true } },
                expected: null
            }, {
                params: { someVar: null },
                constraints: { someVar: { presence: true } },
                expected: { someVar: ['Some Var can\'t be blank'] }
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { presence: true } },
                expected: { someVar: ['Some Var can\'t be blank'] }
            }, {
                params: { someVar: null },
                constraints: { someVar: { presence: false } },
                expected: null
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { presence: false } },
                expected: null
            },
            
            {
                params: { someVar: 'hello ' },
                constraints: { someVar: { presence: { disallowEmpty: false } } },
                expected: null
            }, {
                params: { someVar: 789 },
                constraints: { someVar: { presence: { disallowEmpty: false } } },
                expected: null
            }, {
                params: { someVar: '' },
                constraints: { someVar: { presence: { disallowEmpty: false } } },
                expected: null
            }, {
                params: { someVar: [] },
                constraints: { someVar: { presence: { disallowEmpty: false } } },
                expected: null
            }, {
                params: { someVar: null },
                constraints: { someVar: { presence: { disallowEmpty: false } } },
                expected: { someVar: ['Some Var can\'t be blank'] }
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { presence: { disallowEmpty: false } } },
                expected: { someVar: ['Some Var can\'t be blank'] }
            },

            {
                params: { someVar: 'hello ' },
                constraints: { someVar: { presence: { disallowEmpty: true } } },
                expected: null
            }, {
                params: { someVar: 789 },
                constraints: { someVar: { presence: { disallowEmpty: true } } },
                expected: null
            }, {
                params: { someVar: '' },
                constraints: { someVar: { presence: { disallowEmpty: true } } },
                expected: { someVar: ['Some Var can\'t be blank'] }
            }, {
                params: { someVar: [] },
                constraints: { someVar: { presence: { disallowEmpty: true } } },
                expected: { someVar: ['Some Var can\'t be blank'] }
            }, 
            
            
            {
                params: { someVar: null },
                constraints: { someVar: { presence: { disallowEmpty: true } } },
                expected: { someVar: ['Some Var can\'t be blank'] }
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { presence: { disallowEmpty: true } } },
                expected: { someVar: ['Some Var can\'t be blank'] }
            }

        ];

        runTests(tests);
    });

    describe('email', function() {
        const tests = [
            {
                params: { someVar: 'steve@test.com' },
                constraints: { someVar: { email: true } },
                expected: null
            }, {
                params: { someVar: 'steve@test.com' },
                constraints: { someVar: { email: false } },
                expected: null
            }, {
                params: { someVar: 'hello' },
                constraints: { someVar: { email: true } },
                expected: { someVar: ['Some Var is not a valid email'] }
            }, {
                params: { someVar: 789 },
                constraints: { someVar: { email: true } },
                expected: { someVar: ['Some Var is not a valid email'] }
            }, {
                params: { someVar: '' },
                constraints: { someVar: { email: true } },
                expected: { someVar: ['Some Var is not a valid email'] }
            }, {
                params: { someVar: '' },
                constraints: { someVar: { email: false } },
                expected: null
            }, {
                params: { someVar: null },
                constraints: { someVar: { email: true } },
                expected: null
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { email: true } },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('url', function() {
        const tests = [
            {
                params: { someVar: 'https://google.com' },
                constraints: { someVar: { url: true } },
                expected: null
            }, {
                params: { someVar: 'https://google.com' },
                constraints: { someVar: { url: false } },
                expected: null
            }, {
                params: { someVar: 'steve@test.com' },
                constraints: { someVar: { url: true } },
                expected: { someVar: ['Some Var is not a valid url'] }
            }, {
                params: { someVar: 789 },
                constraints: { someVar: { url: true } },
                expected: { someVar: ['Some Var is not a valid url'] }
            }, {
                params: { someVar: 789 },
                constraints: { someVar: { url: false } },
                expected: null
            }, {
                params: { someVar: '' },
                constraints: { someVar: { url: true } },
                expected: { someVar: ['Some Var is not a valid url'] }
            }, {
                params: { someVar: null },
                constraints: { someVar: { url: true } },
                expected: null
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { url: true } },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('date', function() {
        const tests = [
            {
                params: { someVar: new Date() },
                constraints: { someVar: { date: true } },
                expected: null
            }, {
                params: { someVar: 'steve@test.com' },
                constraints: { someVar: { date: true } },
                expected: { someVar: ['Some Var is not an instance of Date'] }
            }, {
                params: { someVar: 789 },
                constraints: { someVar: { date: true } },
                expected: { someVar: ['Some Var is not an instance of Date'] }
            }, {
                params: { someVar: '' },
                constraints: { someVar: { date: true } },
                expected: { someVar: ['Some Var is not an instance of Date'] }
            }, {
                params: { someVar: null },
                constraints: { someVar: { date: true } },
                expected: null
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { date: true } },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('numericality', function() {
        const tests = [
            {
                params: { someVar: 4 },
                constraints: { someVar: { numericality: { greaterThan: 3 } } },
                expected: null
            }, {
                params: { someVar: 4.1 },
                constraints: { someVar: { numericality: { pattern: /^\d\.\d$/ } } },
                expected: null
            }, {
                params: { someVar: 4.12 },
                constraints: { someVar: { numericality: { pattern: /^\d\.\d$/ } } },
                expected: { someVar: ['Some Var has wrong format'] }
            }, {
                params: { someVar: 4 },
                constraints: { someVar: { numericality: {
                    greaterThan: 3,
                    lessThan: 5
                } } },
                expected: null
            }, {
                params: { someVar: 4 },
                constraints: { someVar: { numericality: { greaterThan: 4 } } },
                expected: { someVar: ['Some Var is not greater than 4'] }
            }, {
                params: { someVar: 4 },
                constraints: { someVar: { numericality: { greaterThanOrEqualTo: 4 } } },
                expected: null
            }, {
                params: { someVar: 3 },
                constraints: { someVar: { numericality: { greaterThanOrEqualTo: 4 } } },
                expected: { someVar: ['Some Var is not greater than or equal to 4'] }
            }, {
                params: { someVar: 2 },
                constraints: { someVar: { numericality: { lessThan: 3 } } },
                expected: null
            }, {
                params: { someVar: 3 },
                constraints: { someVar: { numericality: { lessThan: 3 } } },
                expected: { someVar: ['Some Var is not less than 3'] }
            }, {
                params: { someVar: 3 },
                constraints: { someVar: { numericality: false } },
                expected: null
            }, {
                params: { someVar: 3 },
                constraints: { someVar: { numericality: { lessThanOrEqualTo: 3 } } },
                expected: null
            }, {
                params: { someVar: 4 },
                constraints: { someVar: { numericality: { lessThanOrEqualTo: 3 } } },
                expected: { someVar: ['Some Var is not less than or equal to 3'] }
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { numericality: { greaterThan: 3 } } },
                expected: null
            }, {
                params: { someVar: null },
                constraints: { someVar: { numericality: { greaterThan: 3 } } },
                expected: null
            }, {
                params: { someVar: 4 },
                constraints: { someVar: { numericality: { onlyInteger: true } } },
                expected: null
            }, {
                params: { someVar: 4.01 },
                constraints: { someVar: { numericality: { onlyInteger: true } } },
                expected: { someVar: ['Some Var is not an integer'] }
            }, {
                params: { someVar: '4' },
                constraints: { someVar: { numericality: { greaterThan: 3 } } },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('inclusion', function() {
        const tests = [
            {
                params: { someVar: 'a' },
                constraints: { someVar: { inclusion: { within: ['a', 'b'] } } },
                expected: null
            }, {
                params: { someVar: 'a' },
                constraints: { someVar: { inclusion: ['a', 'b'] } },
                expected: null
            }, {
                params: { someVar: 'b' },
                constraints: { someVar: { inclusion: { within: ['a', 'b'] } } },
                expected: null
            }, {
                params: { someVar: '' },
                constraints: { someVar: { inclusion: { within: ['a', 'b'] } } },
                expected: { someVar: ['Some Var is not included in the list'] }
            }, {
                params: { someVar: null },
                constraints: { someVar: { inclusion: { within: ['a', 'b'] } } },
                expected: null
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { inclusion: { within: ['a', 'b'] } } },
                expected: null
            }, {
                params: { someVar: 'c' },
                constraints: { someVar: { inclusion: { within: ['a', 'b'] } } },
                expected: { someVar: ['Some Var is not included in the list'] }
            }, {
                params: { someVar: 'c' },
                constraints: { someVar: { inclusion: ['a', 'b'] } },
                expected: { someVar: ['Some Var is not included in the list'] }
            }, {
                params: { someVar: 'c' },
                constraints: { someVar: { inclusion: false } },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('format', function() {
        const tests = [
            {
                params: { someVar: '1' },
                constraints: { someVar: { format: { pattern: '\\d' } } },
                expected: null
            }, {
                params: { someVar: '1' },
                constraints: { someVar: { format: { pattern: /^\d$/ } } },
                expected: null
            }, {
                params: { someVar: '1' },
                constraints: { someVar: { format: '\\d' } },
                expected: null
            }, {
                params: { someVar: 'Director' },
                constraints: { someVar: { format: /^\w.+\w$/ } },
                expected: null
            }, {
                params: { someVar: 'b' },
                constraints: { someVar: { format: { pattern: '\\d' } } },
                expected: { someVar: ['Some Var is in the wrong format'] }
            }, {
                params: { someVar: 'b' },
                constraints: { someVar: { format: { pattern: /^\d$/ } } },
                expected: { someVar: ['Some Var is in the wrong format'] }
            }, {
                params: { someVar: '' },
                constraints: { someVar: { format: { pattern: '\\d' } } },
                expected: { someVar: ['Some Var is in the wrong format'] }
            }, {
                params: { someVar: '1a' },
                constraints: { someVar: { format: { pattern: '\\d' } } },
                expected: { someVar: ['Some Var is in the wrong format'] }
            }, {
                params: { someVar: null },
                constraints: { someVar: { format: { pattern: '\\d' } } },
                expected: null
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { format: { pattern: 'a' } } },
                expected: null
            }, {
                params: { someVar: 'A' },
                constraints: { someVar: { format: { pattern: 'a' } } },
                expected: { someVar: ['Some Var is in the wrong format'] }
            }, {
                params: { someVar: 'A' },
                constraints: { someVar: { format: { pattern: 'a', flags: 'i' } } },
                expected: null
            }, {
                params: { someVar: 'A' },
                constraints: { someVar: { format: false } },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('array', function() {
        const tests = [
            {
                params: { someVar: [] },
                constraints: { someVar: { array: true } },
                expected: null
            }, {
                params: { someVar: 999 },
                constraints: { someVar: { array: false } },
                expected: null
            }, {
                params: { someVar: [1,2,3,4] },
                constraints: { someVar: { array: true } },
                expected: null
            }, {
                params: { someVar: 999 },
                constraints: { someVar: { array: true } },
                expected: { someVar: ['Some Var is not an array'] }
            }, {
                params: { someVar: 'foo' },
                constraints: { someVar: { array: true } },
                expected: { someVar: ['Some Var is not an array'] }
            }, {
                params: { someVar: null },
                constraints: { someVar: { array: true } },
                expected: null
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { array: true } },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('bool', function() {
        const tests = [
            {
                params: { someVar: true },
                constraints: { someVar: { bool: true } },
                expected: null
            }, {
                params: { someVar: true },
                constraints: { someVar: { bool: false } },
                expected: null
            }, {
                params: { someVar: false },
                constraints: { someVar: { bool: true } },
                expected: null
            }, {
                params: { someVar: '' },
                constraints: { someVar: { bool: true } },
                expected: { someVar: ['Some Var is not boolean'] }
            }, {
                params: { someVar: '' },
                constraints: { someVar: { bool: false } },
                expected: null
            }, {
                params: { someVar: 'true' },
                constraints: { someVar: { bool: true } },
                expected: { someVar: ['Some Var is not boolean'] }
            }, {
                params: { someVar: null },
                constraints: { someVar: { bool: true } },
                expected: null
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { bool: true } },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('length', function() {
        const tests = [
            {
                params: { someVar: [1,2,3,4] },
                constraints: { someVar: { length: { minimum: 4 } } },
                expected: null
            }, {
                params: { someVar: [1,2,3,4] },
                constraints: { someVar: { length: { maximum: 4 } } },
                expected: null
            }, {
                params: { someVar: 'four' },
                constraints: { someVar: { length: { minimum: 4 } } },
                expected: null
            }, {
                params: { someVar: 'four' },
                constraints: { someVar: { length: { maximum: 4 } } },
                expected: null
            }, {
                params: { someVar: 'four' },
                constraints: { someVar: { length: { minimum: 5 } } },
                expected: { someVar: ['Some Var is too short (minimum length is 5)'] }
            }, {
                params: { someVar: 'four' },
                constraints: { someVar: { length: { maximum: 3 } } },
                expected: { someVar: ['Some Var is too long (maximum length is 3)'] }
            }, {
                params: { someVar: [1,2,3,4] },
                constraints: { someVar: { length: { minimum: 5 } } },
                expected: { someVar: ['Some Var is too short (minimum length is 5)'] }
            }, {
                params: { someVar: [1,2,3,4] },
                constraints: { someVar: { length: { maximum: 3 } } },
                expected: { someVar: ['Some Var is too long (maximum length is 3)'] }
            }, {
                params: { someVar: [1,2,3,4] },
                constraints: { someVar: { length: false } },
                expected: null
            }, {
                params: { someVar: '' },
                constraints: { someVar: { length: { exactly: 0 } } },
                expected: null
            }, {
                params: { someVar: '1' },
                constraints: { someVar: { length: { exactly: 0 } } },
                expected: { someVar: ['Some Var has length that is not exactly 0'] }
            }, {
                params: { someVar: null },
                constraints: { someVar: { length: { minimum: 4 } } },
                expected: null
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { length: { minimum: 4 } } },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('dependency', function() {
        const tests = [
            {
                params: { a: 1, b: 2 },
                constraints: {
                    a: {
                        dependency: { 
                            test: value => value === 1,
                            ensure: (_, attrs) => attrs.b === 2
                        }
                    }
                },
                expected: null
            }, {
                params: { foo: { a: 1, b: 2 } },
                constraints: {
                    foo: {
                        object: {
                            a: {
                                dependency: { 
                                    test: value => value === 1,
                                    ensure: (_, attrs) => attrs.b === 999
                                }
                            }
                        }
                    }
                },
                expected: { 'foo.a': ['A dependency error'] }
            }, {
                params: { foo: { a: 1, b: 2 } },
                constraints: {
                    foo: {
                        object: {
                            a: {
                                dependency: { 
                                    test: value => value === 1,
                                    ensure: (_, attrs) => attrs.b === 999,
                                    message: 'some message'
                                }
                            }
                        }
                    }
                },
                expected: { 'foo.a': ['some message'] }
            }, {
                params: { a: 1, b: 2 },
                constraints: {
                    a: {
                        dependency: [{ 
                            test: value => value === 888,
                            ensure: (_, attrs) => attrs.b === 999
                        }]
                    }
                },
                expected: null
            }, {
                params: { a: null, b: 2 },
                constraints: {
                    a: {
                        dependency: { 
                            test: value => value === 1,
                            ensure: (_, attrs) => attrs.b === 999
                        }
                    }
                },
                expected: null
            }, {
                params: { a: 1, b: 2 },
                constraints: {
                    a: {
                        dependency: [{ 
                            test: (_, attrs) => attrs.b === 2,
                            ensure: (_, attrs) => attrs.a === 55,
                            message: 'some message'
                        }]
                    }
                },
                expected: { 'a': ['some message'] }
            }, {
                params: { a: 1, b: 2 },
                constraints: {
                    a: {
                        dependency: [{ 
                            test: (_, attrs) => attrs.b === 10,
                            ensure: (_, attrs) => attrs.a === 55,
                            message: 'some message'
                        }]
                    }
                },
                expected: null
            }, {
                params: { a: 1, b: 2 },
                constraints: {
                    a: {
                        dependency: [{ 
                            test: (_, attrs) => attrs.b === 2,
                            ensure: value => value === 55,
                            message: 'some message'
                        }]
                    }
                },
                expected: { 'a': ['some message'] }
            }, {
                params: { a: 1, b: 2 },
                constraints: {
                    a: {
                        dependency: [{ 
                            test: (_, attrs) => attrs.b === 10,
                            ensure: value => value === 55,
                            message: 'some message'
                        }]
                    }
                },
                expected: null
            }, {
                params: { a: 1, b: 2 },
                constraints: {
                    a: {
                        dependency: [{ 
                            ensure: value => value === 1,
                            message: 'some message'
                        }]
                    }
                },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('ordered', function() {
        const tests = [
            {
                params: { someArray: [1,2,3] },
                constraints: { someArray: { ordered: (current, next) => next > current } },
                expected: null
            }, {
                params: { someArray: [{a: 1}, {a: 2}, {a: 3}] },
                constraints: { someArray: { ordered: (current, next) => next.a > current.a } },
                expected: null
            }, {
                params: { someArray: [1,2,2] },
                constraints: { someArray: { ordered: (current, next) => next > current } },
                expected: { someArray: ['Some Array is not ordered'] }
            }, {
                params: { someArray: [{a: 1}, {a: 1}] },
                constraints: { someArray: { ordered: (current, next) => next.a > current.a } },
                expected: { someArray: ['Some Array is not ordered'] }
            }, {
                params: { someArray: [{a: 1}] },
                constraints: { someArray: { ordered: (current, next) => next.a > current.a } },
                expected: null
            }, {
                params: { someArray: [] },
                constraints: { someArray: { ordered: (current, next) => next.a > current.a } },
                expected: null
            }, {
                params: { someArray: null },
                constraints: { someArray: { ordered: (current, next) => next.a > current.a } },
                expected: null
            }, {
                params: { someArray: undefined },
                constraints: { someArray: { ordered: (current, next) => next.a > current.a } },
                expected: null
            }, {
                params: { someArray: 999 },
                constraints: { someArray: { ordered: (current, next) => next.a > current.a } },
                expected: null
            }, {
                params: { someArray: 'foo' },
                constraints: { someArray: { ordered: (current, next) => next.a > current.a } },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('uuid', function() {
        const tests = [
            {
                params: { someVar: 'abcd1234abcd1290abcd1234abef5678' },
                constraints: { someVar: { uuid: true } },
                expected: null
            }, {
                params: { someVar: 'foo' },
                constraints: { someVar: { uuid: true } },
                expected: { someVar: ['Some Var is not a UUID'] }
            }, {
                params: { someVar: 'foo' },
                constraints: { someVar: { uuid: false } },
                expected: null
            }, {
                params: { someVar: null },
                constraints: { someVar: { uuid: true } },
                expected: null
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { uuid: true } },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('number', function() {
        const tests = [
            {
                params: { someVar: -3.256 },
                constraints: { someVar: { number: true } },
                expected: null
            }, {
                params: { someVar: '3.5' },
                constraints: { someVar: { number: true } },
                expected: { someVar: ['Some Var is not a number'] }
            }, {
                params: { someVar: 'foo' },
                constraints: { someVar: { number: true } },
                expected: { someVar: ['Some Var is not a number'] }
            }, {
                params: { someVar: 'foo' },
                constraints: { someVar: { number: false } },
                expected: null
            }, {
                params: { someVar: null },
                constraints: { someVar: { number: true } },
                expected: null
            }, {
                params: { someVar: undefined },
                constraints: { someVar: { number: true } },
                expected: null
            }
        ];

        runTests(tests);
    });

    describe('unknown constraint', function() {
        it('should throw an error', function() {
            const params = {
                a: 'foo'
            };

            const constraint = {
                a: {
                    unknownConstraint: true
                }
            };

            expect(() => ensure(params, constraint)).to.throw(
                'Unknown constraint \'unknownConstraint\' specified');
        });
    });

    describe('return errors', function() {
        it('should return an error when params are invalid', function() {
            const params = {
                a: null
            };

            const constraint = {
                a: {
                    presence: true
                }
            };

            const actual = ensure(params, constraint, true);
            expect(actual).to.eql({ a: ['A can\'t be blank'] });
        });

        it('should not return an error when params are invalid', function() {
            const params = {
                a: 'foo'
            };

            const constraint = {
                a: {
                    presence: true
                }
            };

            const actual = ensure(params, constraint, true);
            expect(actual).to.eql(null);
        });
    });
});

function runTests(tests) {
    tests.forEach(test => {
        it('should return ' + JSON.stringify(test.expected) + ' for constraints ' + JSON.stringify(test.constraints) + ' and params ' + JSON.stringify(test.params), () => {
            const actual = ensure(test.params, test.constraints, true);
            expect(actual).to.eql(test.expected);
        });
    });
}
