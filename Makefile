.PHONY: help up down restart build install migrate fresh logs shell

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

up: ## Start containers
	docker-compose up -d

down: ## Stop containers
	docker-compose down

restart: down up ## Restart containers

build: ## Build containers
	docker-compose build --no-cache

install: ## Install dependencies
	docker-compose exec app composer install
	docker-compose exec app npm install

migrate: ## Run migrations
	docker-compose exec app php artisan migrate --force

fresh: ## Fresh database
	docker-compose exec app php artisan migrate:fresh --seed

logs: ## Show logs
	docker-compose logs -f

shell: ## Access container shell
	docker-compose exec app bash

mysql: ## Access MySQL
	docker-compose exec mysql mysql -u laravel -psecret laravel

cache: ## Clear cache
	docker-compose exec app php artisan config:clear
	docker-compose exec app php artisan cache:clear
	docker-compose exec app php artisan view:clear
	docker-compose exec app php artisan route:clear

key: ## Generate app key
	docker-compose exec app php artisan key:generate --force