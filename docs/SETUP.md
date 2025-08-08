# Setup Instructions

## Quick Setup for New Developers

1. Clone the repository
2. Run `./scripts/setup-secrets.sh` to generate environment variables
3. Add `127.0.0.1 local.a.com` to your `/etc/hosts` file
4. Install dependencies: `cd service-a && npm install && cd ../service-b && npm install && cd ../service-c && npm install`
5. Start MongoDB: `brew services start mongodb-community`
6. Start all services: `./scripts/start-services.sh`
7. Visit http://local.a.com/ to test

## Development Workflow

- Use `./scripts/status.sh` to check service health
- Use `./scripts/stop-services.sh` to stop everything
- Check logs in `nginx/logs/` for debugging
