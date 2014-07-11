'use strict';

var Page = require('./');

var pool = document.getElementById('pool') || { text: '{}' };
var main = document.getElementById('main');

window.page = new Page(main, JSON.parse(pool.text));
