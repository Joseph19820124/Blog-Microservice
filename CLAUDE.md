# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a microservices-based blog application template with:
- **Frontend**: React.js (Create React App)
- **Backend**: Node.js/Express microservices
- **Architecture**: Event-driven microservices communicating through an event bus

## Services Structure

- `client/` - React frontend application
- `posts/` - Posts management service
- `comments/` - Comments management service
- `event-bus/` - Central event bus for inter-service communication
- `moderation/` - Content moderation service
- `query/` - Query service (implements CQRS pattern)

## Development Commands

### Using Docker (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Rebuild a specific service
docker-compose build [service-name]
```

### Manual Setup (without Docker)
#### Frontend (Client)
```bash
cd client
npm install          # Install dependencies
npm start           # Start dev server on port 3000
npm test            # Run tests in watch mode
npm run build       # Build for production
```

#### Backend Services
Each backend service uses the same pattern:
```bash
cd [service-name]   # posts, comments, event-bus, moderation, or query
npm install         # Install dependencies
npm start          # Start service with nodemon (auto-restart on changes)
```

**Note**: When running manually, update service URLs from Docker hostnames (e.g., 'event-bus') back to 'localhost'.

## Architecture Patterns

1. **Microservices Communication**: Services communicate via HTTP POST to the event-bus, which broadcasts events to all registered services
2. **Event-Driven**: Services react to events rather than making direct calls to each other
3. **CQRS Pattern**: The query service likely implements read-optimized views of data

## Key Dependencies

- **Frontend**: React 18.2, Axios, Bootstrap 4.3.1 (CDN)
- **Backend**: Express 4.18.2, Axios, CORS (in some services), Nodemon

## Implementation Status

This is a boilerplate template - no actual service logic is implemented yet. When implementing:
1. Create index.js files for each backend service
2. Implement event handlers and HTTP endpoints
3. Build React components in client/src/
4. Set up inter-service event communication through the event-bus