install:
	npm ci
lint:
	npm run lint
lint-fix:
	npm run lint:fix

.PHONY: lint lint-fix