'use strict';

module.exports = function () {
    var args    = can.makeArray(arguments);
    var subject = args.shift();

    args.forEach(function (property) {
        if (subject[property] === undefined) {
            throw new Error(['missing property: ', '"', property, '"'].join(''));
        }
    });
};
