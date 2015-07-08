node_modules: package.json
		@npm install

test: node_modules
		@DEBUG=metalsmith-hyphenate ./node_modules/mocha/bin/mocha --reporter spec --full-trace

.PHONY: test
