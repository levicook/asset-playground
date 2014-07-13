'use strict';

var rhtml  = require('rhtml');
var demand = require('../../demand');

var SiteFooter = require('../../controls/site_footer');
var SiteHeader = require('../../controls/site_header');


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

        this.siteHeader = new SiteHeader(element.find('.siteHeaderHook'));
        this.siteFooter = new SiteFooter(element.find('.siteFooterHook'));
    },

});
