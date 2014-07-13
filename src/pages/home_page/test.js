'use strict';

var fixtures    = require('./fixtures.js');
var fixtureIndex = _.indexBy(fixtures, 'name');

var Page = require('./');

suite(location.pathname, function () {

    suite('default', function () {
        var element, fixture, page;

        setup(function () {
            element = $('<div>');
            fixture = fixtureIndex[this.test.parent.title];
            page = new Page(element, fixture.data);
        });

        test('appended .site_header', function () { tt(element.find('.site_header').is('*')); });
        test('appended .site_footer', function () { tt(element.find('.site_footer').is('*')); });

        test('appended .home_page', function () {
            tt(element.find('.home_page').is('*'));
        });
    });

});
