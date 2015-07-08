node_modules: package.json
		@npm install

lint: node_modules
	@./node_modules/eslint/bin/eslint.js index.js test/index.js -c .eslintrc

test: node_modules
		@./node_modules/mocha/bin/mocha --reporter spec --full-trace

.PHONY: test
