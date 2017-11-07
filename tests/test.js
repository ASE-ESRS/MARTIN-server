/*

There are currently no tests in this directory.
This project uses the Mocha framework for unit testing.
Travis CI runs all of the tests in the /tests directory when building.

*/

var assert = require('assert');

describe('LocationHandler', function() {
    it('Demo test that should pass', function() {
        assert.equal(-1, [1,2,3].indexOf(4));
    });

    it('Demo test that should fail', function() {
        assert.equal(0, [1,2,3].indexOf(1));
    });
});
