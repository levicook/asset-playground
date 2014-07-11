'use strict';

var rhtml  = require('rhtml');
var demand = require('../../../demand');

var Footer = require('../../controls/footer');
var Header = require('../../controls/header');


function validateOptions(options) {
    demand(options);
}


module.exports = can.Control.extend({
    defaults: {
        view: can.stache(rhtml('./main.mustache')),
    }
}, {

    init: function (element, options) {
        validateOptions(options);

        this.model = {}; 

        element.append(options.view(this.model));

        this.header = new Header(element.find('.headerHook'));

        this.footer = new Footer(element.find('.footerHook'));
    },

});
