'use strict';

var Control = require('./');

suite(location.pathname, function () {
    var element, control;

    setup(function () {
        element = $('<div>');
        control = new Control(element);
    });

    test('appended .main-header', function () {
        tt(element.find('.main-header').is('*'));
    });
});
