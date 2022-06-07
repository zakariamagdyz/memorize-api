build-dev:
	docker build \
		-t memo-api-dev \
		.
logs:
	docker logs -f memorize-backend