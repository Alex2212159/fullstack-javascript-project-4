install:
	npm ci
publish:
	npm publish --dry-run
lint:
	npm run lint
lint-fix:
	npm run lint:fix
test:
	npm test
test-coverage:
	npm run test:coverage

.PHONY: lint lint-fix test test-coverage