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
        assert.equal(false, martinServer.validLatitudeRange(null));
      });

      it('Latitude syntax adhering to Regex Spec', function() {
        assert.equal(true, martinServer.validLatitudeRange(26.4));
      });

      it('Latitude syntax not adhering to Regex Spec', function() {
        assert.equal(false, martinServer.validLatitudeRange("56.5-).3.89"));
      });

    });

    describe('Validate longitude conforms to normal convention', function(){
      it('Longitude value is within range test - check boundary case (positive)', function() {
        assert.equal(true, myCode.checkLongRange(180.000000));
      });

      it('Longitude value is within range test - check boundary case (negative)', function() {
        assert.equal(true, myCode.checkLongRange(-180.000000));
      });

      it('Longitude value is within range test - check boundary case (zero)', function() {
        assert.equal(true, myCode.checkLongRange(0));
      });

      it('Longitude value is within range test - check normal case', function() {
        assert.equal(true, myCode.checkLongRange(-87.647352));
      });

      it('Longitude value is within range test - check for string input', function() {
        assert.equal(true, myCode.checkLongRange("91.075"));
      });

      it('Longitude value is NOT within range test - check for out of bounds case', function() {
        assert.deepEqual(false, myCode.checkLongRange(-196.856));
      });

      it('Longitude returns false when null parameter used', function() {
        assert.equal(false, myCode.validateLon(null));
      });

      it('Longitude syntax adhering to Regex Spec', function() {
        assert.equal(true, myCode.validateLon(76.901));
      });

      it('Longitude syntax not adhering to Regex Spec', function() {
        assert.equal(false, myCode.validateLon("1.34.2.&"));
      });
    });

    describe('validateDistance only accepting valid distances', function(){
      it('Distance returns false when null parameter used', function() {
        assert.equal(false, myCode.validateDistance(null));
      });

      it('Distance returns false when non-integer parameter used (decimal)', function() {
        assert.equal(false, myCode.validateDistance(100.00004));
      });

      it('Distance returns true wheninteger parameter used', function() {
        assert.equal(true, myCode.validateDistance(74));
      });
    });

    describe('Caluclate radius from current location', function() {
      it('Check latitude calculation is correct', function() {
        var latChange = Math.abs(15*(1/(110.574*1000)));
        assert.equal(latChange, myCode.getRadiusLat(15));
      });

      it('Check latitude calculation for incorrect input', function() {
        var distance = 5;
        var latChange = Math.abs(distance*(1/(110.574*1000)));
        assert.notEqual(latChange, myCode.getRadiusLat(8));
      });

      it('Check longitude calculation is correct', function() {
        var lonChange = Math.abs(34*(1/(111.320*1000)));
        assert.equal(lonChange, myCode.getRadiusLon(34));
      });

      it('Check longitude calculation for incorrect input', function() {
        var distance = 11;
        var lonChange = Math.abs(distance*(1/(110.574*1000)));
        assert.notEqual(lonChange, myCode.getRadiusLon(98));
      });
    });

    describe('Testing functions with single operations', function() {
      it('Check start position calculation - correct input', function() {
        var startPos = 5;
        var change = 17;
        assert.equal((startPos-change), myCode.getStartPos(startPos, change));
      });

      it('Check start position calculation - incorrect input', function() {
        var startPos = 5;
        var change = 17;
        assert.notEqual((startPos+2-change-8), myCode.getStartPos(startPos, change));
      });

      it('Check end position calculation - correct input', function() {
        var endPos = 14;
        var change = 9;
        assert.equal((endPos+change), myCode.getEndPos(endPos, change));
      });

      it('Check end position calculation - incorrect input', function() {
        var endPos = 14;
        var change = 9;
        assert.notEqual((endPos+81+change-9), myCode.getEndPos(endPos, change));
      });

      it('Ensure correct minimum value extracted - expFrom', function() {
        var a = 1000;
        var b = 78.192;
        assert.equal(Math.min(a,b), myCode.expFrom(a,b));
      });

      it('Ensure correct maximum value extracted - expTo', function() {
        var a = 563;
        var b = 129;
        assert.equal(Math.max(a,b), myCode.expTo(a,b));
      });



    });



});
