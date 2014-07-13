'use strict';

var Control = require('./');

suite(location.pathname, function () {
    var element, control;

    setup(function () {
        element = $('<div>');
        control = new Control(element);
    });

    test('appended .site_footer', function () {
        tt(element.find('.site_footer').is('*'));
    });
});
