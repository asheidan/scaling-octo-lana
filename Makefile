JSX = jsx
COMPILE.jsx = $(JSX) --cache-dir .module-cache
#COMPILE.jsx += --source-map-inline --e6module

JSSRC = $(shell find js -name '*.js')
JSXSRC = $(shell find jsx -name '*.jsx')
SRC  = $(subst js/,tmp/,$(JSSRC))
#SRC += $(subst jsx/,tmp/,$(JSXSRC:.jsx=.js))

default: bundle.js

dependencies: react react-router
	bower install $^

tmp/%.js: jsx/%.js | tmp
	$(COMPILE.jsx) $(<D) $(@D) $* && touch $@ && touch $@

tmp/%.js: js/%.js | tmp
	cp $^ $@

%.min.js: %js
	uglifyjs -o $@

bundle.js: tmp/offline.js js/store.js js/actions.js
	browserify -d -o $@ $< || rm $@

%.min.js: %.js
	uglifyjs $^ -o $@

tmp:
	mkdir $@

clean:
	$(RM) -r tmp bundle.js
