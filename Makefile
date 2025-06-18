.PHONY: dev-setup dev-start dev-stop dev-restart dev-logs dev-shell db-shell test clean

# Development Environment
dev-setup:
	@chmod +x scripts/dev-setup.sh
	@./scripts/dev-setup.sh

dev-start:
	docker-compose -f docker-compose.dev.yaml up -d

dev-stop:
	docker-compose -f docker-compose.dev.yaml down

dev-restart:
	docker-compose -f docker-compose.dev.yaml restart app

dev-logs:
	docker-compose -f docker-compose.dev.yaml logs -f app

dev-shell:
	docker-compose -f docker-compose.dev.yaml exec app sh

# Database
db-shell:
	docker-compose -f docker-compose.dev.yaml exec db psql -U postgres -d atenas_dev

migration-run:
	docker-compose -f docker-compose.dev.yaml exec app pnpm run migration:run

migration-create:
	docker-compose -f docker-compose.dev.yaml exec app pnpm run migration:create

# Testing
test:
	docker-compose -f docker-compose.dev.yaml exec app pnpm run test:all

# Cleanup
clean:
	docker-compose -f docker-compose.dev.yaml down -v
	docker system prune -f