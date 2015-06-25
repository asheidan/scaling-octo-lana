JSX = jsx
COMPILE.jsx = $(JSX) --e6module --source-map-inline --cache-dir .module-cache

JSSRC = $(shell find js -name '*.js')
JSXSRC = $(shell find jsx -name '*.jsx')
SRC  = $(subst js/,tmp/,$(JSSRC))
#SRC += $(subst jsx/,tmp/,$(JSXSRC:.jsx=.js))

default: tmp/offline.js

tmp/%.js: jsx/%.js | tmp
	$(COMPILE.jsx) $(<D) $(@D) $*

tmp/%.js: js/%.js | tmp
	cp $^ $@

%.min.js: %js
	uglifyjs -o $@

bundle.js: $(SRC)
	browserify --debug -o $@ $^

%.min.js: %.js
	uglifyjs $^ -o $@

tmp:
	mkdir $@

clean:
	$(RM) -r tmp
