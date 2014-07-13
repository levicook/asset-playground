SHELL := /bin/bash

SRC_JS        := $(shell find src -type f -name '*.js')
SRC_LESS      := $(shell find src -type f -name '*.less')

SRC_PAGE_LESS := $(shell find src/pages -type f -name 'main.less')
DST_PAGE_CSS  := $(SRC_PAGE_LESS:src/%.less=dist/%.css)

SRC_PAGE_JS   := $(shell find src/pages -type f -name 'main.js')
DST_PAGE_JS   := $(SRC_PAGE_JS:src/%.js=dist/%.js)

#-------------

.PHONY: all clean dist dist-css dist-js

all:
	@make clean
	@make dist -j8

clean:
	@rm -fr dist/**

#-------------

dist: dist-css dist-js
	@gulp dist
	@find dist -name vendor-main.js -o -name main.js -o -name main.css | xargs rm
	@find dist -name '*.js' -o -name '*.css' | parallel 'gzip < {} > {}.gz'

dist-css: $(DST_PAGE_CSS)

dist-js: $(DST_PAGE_JS)

dist/%.css: $(SRC_LESS)
	@lessc --compress $(subst .css,.less,$(subst dist,src,$@)) $@

dist/%.js: $(SRC_PAGE_JS)
	@mkdir -p $(@D)
	@browserify --ig -t rfileify $(subst dist,src,$@) | uglifyjs --compress > $@
