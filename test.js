/*
This project uses the Mocha framework for unit testing.
Travis CI runs all of the tests in the /tests directory when building.
*/

var assert = require('assert');
var chai = require('chai');
var martinServer = require('./index.js');

describe('Input validation tests', function() {
    describe('wellFormedLatLongFunction', function() {
        it('wellFormedLatLongFunction test - check positive value', function() {
            assert.equal(true, martinServer.wellFormedLatLong(50.0));
        });

        it('wellFormedLatLongFunction test - check negative value', function() {
            assert.equal(true, martinServer.wellFormedLatLong(-200.983));
        });

        it('wellFormedLatLongFunction test - 0 as a valid input', function() {
            assert.equal(true, martinServer.wellFormedLatLong(0));
        });

        it('wellFormedLatLongFunction test - test for strings', function() {
            assert.equal(false, martinServer.wellFormedLatLong("hello world"));
        });
    });

    describe('Validate latitude conforms to its standard domain (range)', function() {
        it('Latitude value is within range test - check boundary case (positive)', function() {
            assert.equal(true, martinServer.validLatitudeRange(90.000000));
        });

        it('Latitude value is within range test - check boundary case (negative)', function() {
            assert.equal(true, martinServer.validLatitudeRange(-90.000000));
        });

        it('Latitude value is within range test - check boundary case (zero)', function() {
            assert.equal(true, martinServer.validLatitudeRange(0));
        });

        it('Latitude value is within range test - check normal case', function() {
            assert.equal(true, martinServer.validLatitudeRange(14.647352));
        });

        it('Latitude value is within range test - check for string input', function() {
            assert.equal(true, martinServer.validLatitudeRange("9.754"));
        });

        it('Latitude value is NOT within range test - check for out of bounds case', function() {
            assert.equal(false, martinServer.validLatitudeRange(207.81));
        });

        it('Latitude returns false when null parameter used', function() {
            assert.equal(false, martinServer.validLatitude(null));
        });
        //--------

        it('Latitude returns true when given a valid parameter (boundary case)', function() {
            assert.equal(true, martinServer.validLatitude(90));
        });

        it('Latitude returns false when given a parameter which does not pass the RegEx specification', function() {
            assert.equal(false, martinServer.validLatitude("12.8s91"));
        });

        it('Latitude returns false on an exception case (out of bounds)', function() {
            assert.equal(false, martinServer.validLatitude(90.00001));
        });

        it('TESTTESTTEST', function() {
            assert.equal(false, martinServer.validLatitude("ABCDEFG"));
        });

        it('Longitude returns true when given a valid parameter (boundary case)', function() {
            assert.equal(true, martinServer.validLongitude(-180));
        });

        it('Longitude returns false when given a parameter which does not pass the RegEx specification', function() {
            assert.equal(false, martinServer.validLongitude("81.abc"));
        });

        it('Longitude returns false on an exception case (out of bounds)', function() {
            assert.equal(false, martinServer.validLongitude(18.00001));
        });

        it('TESTTESTTEST', function() {
            assert.equal(false, martinServer.validLongitude("WXYZ"));
        });

        //----------
        it('Latitude syntax adhering to Regex Spec', function() {
            assert.equal(true, martinServer.validLatitudeRange(26.4));
        });

        it('Latitude syntax not adhering to Regex Spec', function() {
            assert.equal(false, martinServer.validLatitudeRange("56.5-).3.89"));
        });

    });

    describe('Validate longitude conforms to normal convention', function(){
        it('Longitude value is within range test - check boundary case (positive)', function() {
            assert.equal(true, martinServer.validLongitudeRange(180.000000));
        });

        it('Longitude value is within range test - check boundary case (negative)', function() {
            assert.equal(true, martinServer.validLongitudeRange(-180.000000));
        });

        it('Longitude value is within range test - check boundary case (zero)', function() {
            assert.equal(true, martinServer.validLongitudeRange(0));
        });

        it('Longitude value is within range test - check normal case', function() {
            assert.equal(true, martinServer.validLongitudeRange(-87.647352));
        });

        it('Longitude value is within range test - check for string input', function() {
            assert.equal(true, martinServer.validLongitudeRange("91.075"));
        });

        it('Longitude value is NOT within range test - check for out of bounds case', function() {
            assert.deepEqual(false, martinServer.validLongitudeRange(-196.856));
        });

        it('Longitude returns false when null parameter used', function() {
            assert.equal(false, martinServer.validLongitude(null));
        });

        it('Longitude syntax adhering to Regex Spec', function() {
            assert.equal(true, martinServer.validLongitudeRange(76.901));
        });

        it('Longitude syntax not adhering to Regex Spec', function() {
            assert.equal(false, martinServer.validLongitudeRange("1.34.2.&"));
        });
    });

    describe('Ensure the parameter validation function works correctly — this ties together a number of different other functions', function(){
        it('Valid input check', function() {
            assert.equal(true, martinServer.validParameters("50.77504482670429", "50.95591917329571", "-0.1749249174991017", "0.004737317499101695"));
        });

        // These tests don't work as the functions they invoke call the `abortLocationUpdate` function before returning.

        // it('Out-of-bounds start lat', function() {
        //     assert.equal(false, martinServer.validParameters("450.77504482670429", "50.95591917329571", "-0.1749249174991017", "0.004737317499101695"));
        // });
        //
        // it('Out-of-bounds end lat', function() {
        //     assert.equal(false, martinServer.validParameters("50.77504482670429", "-450.95591917329571", "-0.1749249174991017", "0.004737317499101695"));
        // });
        //
        // it('Out-of-bounds start long', function() {
        //     assert.equal(false, martinServer.validParameters("50.77504482670429", "50.95591917329571", "-500.1749249174991017", "0.004737317499101695"));
        // });
        //
        // it('Out-of-bounds end long', function() {
        //     assert.equal(false, martinServer.validParameters("50.77504482670429", "50.95591917329571", "-0.1749249174991017", "600.004737317499101695"));
        // });
        //
        // it('Null parameter check', function() {
        //     assert.equal(false, martinServer.validParameters("50.77504482670429", "50.95591917329571", "-0.1749249174991017", null));
        // });
        //
        // it('Null parameters check', function() {
        //     assert.equal(false, martinServer.validParameters(null, null, null, null));
        // });
    });
});
