'use strict';

var rhtml    = require('rhtml');
var contains = require('../shared/strings').contains;

var Page = can.Control.extend({
    defaults: {
        view: can.stache(rhtml('./main.mustache'))
    }
}, {
    init: function (element, options) {
        var demos = options.demos.map(function (path) {
            return {
                path: path,
                hide: can.compute(false),
            };
        });

        var tests = options.tests.map(function (path) {
            return {
                path: path,
                hide: can.compute(false),
            };
        });

        var filter = function (c, el) {
            var val = el.val().toLowerCase();

            _.each(demos.concat(tests), function (row) {
                var path = row.path.toLowerCase();

                row.hide(!contains(path, val));
            });
        };

        this.model = {
            filter : filter,
            demos  : demos,
            tests  : tests,
        };

        element.append(options.view(this.model));
    }
});

can.ajax({
    url: '/demos-and-tests.json'
})
.then(function (response) {
    var main = document.getElementById('main');
    window.page = new Page(main, response);
});
