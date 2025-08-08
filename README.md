# SSO Multi-Service Architecture

A comprehensive Single Sign-On (SSO) implementation using Next.js, NextAuth.js, and MongoDB with NGINX reverse proxy routing. This project demonstrates secure authentication across multiple microservices with shared session management.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        NGINX Reverse Proxy                     │
│                      (local.a.com:80)                         │
└─────────────────┬──────────────┬──────────────┬────────────────┘
                  │              │              │
                  ▼              ▼              ▼
        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │  Service A  │ │  Service B  │ │  Service C  │
        │ (Port 3000) │ │ (Port 3001) │ │ (Port 3002) │
        │ Main Auth   │ │ Secondary   │ │ Secondary   │
        └─────────────┘ └─────────────┘ └─────────────┘
                  │              │              │
                  └──────────────┼──────────────┘
                                 │
                        ┌─────────────┐
                        │   MongoDB   │
                        │ (Port 27017)│
                        │ Shared DB   │
                        └─────────────┘
```

### URL Routing Structure

- `http://local.a.com/` → Service A (Main Authentication)
- `http://local.a.com/b/` → Service B (Secondary Service)
- `http://local.a.com/c/` → Service C (Secondary Service)
- `http://local.a.com/health` → Health Check Endpoint

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Community Edition
- NGINX (installed via Homebrew on macOS)

### 1. Clone and Install

```bash
git clone <repository-url>
cd sso-multi-service
```

### 2. Install Dependencies

```bash
cd service-a && npm install && cd ../service-b && npm install && cd ../service-c && npm install && cd ..
```

### 3. Generate Shared Secrets

```bash
chmod +x scripts/setup-secrets.sh
./scripts/setup-secrets.sh
```

### 4. Configure Local Domain

Add this line to your `/etc/hosts` file:

```
127.0.0.1 local.a.com
```

### 5. Start MongoDB

```bash
brew services start mongodb-community
```

### 6. Start All Services

```bash
chmod +x scripts/start-services.sh
./scripts/start-services.sh
```

### 7. Access the Application

Visit `http://local.a.com/` to begin using the SSO system.

## 🏭 Service Details

### Service A - Main Authentication Service

- **Port**: 3000
- **Role**: Primary authentication provider
- **Features**:
  - User registration and login
  - NextAuth.js configuration
  - JWT token generation
  - Session management
  - Password hashing with bcrypt

### Service B & C - Secondary Services

- **Ports**: 3001, 3002
- **Role**: Protected services that consume authentication
- **Features**:
  - Shared session validation
  - Automatic authentication via cookies
  - Cross-service user data access

### Shared Database (MongoDB)

- **Collections**: Users, Sessions
- **Features**:
  - Centralized user management
  - Service usage tracking
  - Connection pooling and health monitoring

## 🔧 Technology Stack

### Frontend & Backend

- **Framework**: Next.js 15.4.6 with App Router
- **Authentication**: NextAuth.js v5.0 (Beta)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 4.0

### Database & Storage

- **Database**: MongoDB 8+ with Mongoose ODM
- **Session Storage**: JWT with secure cookie sharing

### DevOps & Infrastructure

- **Reverse Proxy**: NGINX with custom configuration
- **Process Management**: Bash scripts for orchestration
- **Development**: Hot reload with Turbopack

### Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure session tokens
- **Cookie Security**: HttpOnly, SameSite, Domain-scoped
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Comprehensive error boundaries

## 🔐 SSO Implementation Details

### Cookie-Based Session Sharing

Sessions are shared across services using domain-scoped cookies:

```typescript
cookies: {
  sessionToken: {
    name: 'next-auth.session-token',
    options: {
      domain: '.local.a.com',  // Shared across all services
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    },
  },
}
```

### Authentication Flow

1. User logs in via Service A (`/login`)
2. Credentials verified against MongoDB
3. JWT token created and stored in domain cookie
4. User accesses Service B/C via NGINX routing
5. Services validate existing session automatically
6. Seamless cross-service authentication experience

### Security Measures

- Passwords hashed with 12-round bcrypt salting
- JWT tokens with 24-hour expiration
- Secure cookie configuration for production
- CSRF protection enabled
- Input sanitization and validation

## 📁 Project Structure

```
sso-multi-service/
├── service-a/                 # Main authentication service
│   ├── src/app/
│   │   ├── api/auth/          # NextAuth.js API routes
│   │   ├── login/             # Login page
│   │   └── signup/            # Registration page
│   ├── src/lib/
│   │   ├── models/User.ts     # MongoDB user model
│   │   └── config/database.ts # Database connection
│   └── auth.ts                # NextAuth configuration
├── service-b/                 # Secondary service
├── service-c/                 # Secondary service
├── nginx/
│   ├── nginx.conf             # Reverse proxy configuration
│   └── logs/                  # Access and error logs
├── scripts/
│   ├── start-services.sh      # Orchestration script
│   ├── stop-services.sh       # Cleanup script
│   ├── setup-secrets.sh       # Environment setup
│   └── check-status.sh        # Health monitoring
└── docs/
    └── SETUP.md               # Detailed setup guide
```

## 🛠️ Development Commands

### Service Management

```bash
# Start all services
./scripts/start-services.sh

# Check service status
./scripts/check-status.sh

# Stop all services
./scripts/stop-services.sh
```

### Individual Service Development

```bash
# Development mode with hot reload
cd service-a && npm run dev
cd service-b && npm run dev -- --port 3001
cd service-c && npm run dev -- --port 3002

# Build for production
npm run build

# Lint code
npm run lint
```

### Database Management

```bash
# Start MongoDB
brew services start mongodb-community

# Stop MongoDB
brew services stop mongodb-community

# MongoDB shell
mongosh
```

## 🔍 Monitoring and Debugging

### Health Check Endpoints

- **System Health**: `http://local.a.com/health`
- **Service A**: `http://localhost:3000`
- **Service B**: `http://localhost:3001`
- **Service C**: `http://localhost:3002`

### Log Files

- **NGINX Access**: `nginx/logs/access.log`
- **NGINX Errors**: `nginx/logs/error.log`
- **Service Logs**: Console output from each service

### Status Monitoring

```bash
./scripts/check-status.sh
```

## 📊 Performance Features

### NGINX Optimizations

- Gzip compression for static assets
- Connection keepalive and pooling
- Upstream server health checks
- Static file caching with long expiry

### Database Optimizations

- Connection pooling (3-15 connections)
- Indexed queries on email and timestamps
- Graceful connection handling
- Automatic retry with exponential backoff

### Development Features

- Hot module replacement via Turbopack
- TypeScript strict mode
- ESLint configuration
- Automatic dependency management

## 🚢 Production Deployment

### Environment Configuration

```bash
# Production environment variables
NODE_ENV=production
MONGODB_URI=mongodb://prod-server:27017/sso_production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
```

### Security Checklist

- [ ] Generate unique `AUTH_SECRET` for production
- [ ] Use HTTPS with valid SSL certificates
- [ ] Set secure cookie flags (`secure: true`)
- [ ] Configure MongoDB authentication
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerting
- [ ] Regular security updates

### Docker Deployment (Optional)

The project can be containerized for production deployment:

```bash
# Build services
docker-compose build

# Deploy with scaling
docker-compose up --scale service-b=2 --scale service-c=2
```

## 🧪 Testing Strategy

### Authentication Testing

1. User registration on Service A
2. Login validation and session creation
3. Cross-service session validation (Service B & C)
4. Logout and session cleanup
5. Password security and hashing verification

### Integration Testing

1. NGINX routing to correct services
2. Database connection and CRUD operations
3. Environment variable loading
4. Cookie domain sharing
5. Error handling and recovery

## 🤝 Contributing

1. Read [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
2. Follow the existing code style and TypeScript patterns
3. Test the complete authentication flow after changes
4. Update documentation for new features
5. Submit pull requests with clear descriptions

## 🔒 Security

Please review [SECURITY.md](SECURITY.md) for security guidelines and reporting procedures.

## 📄 License

This project is for educational and demonstration purposes. See individual package licenses for dependencies.

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Failed**

```bash
# Start MongoDB service
brew services start mongodb-community

# Check if running
brew services list | grep mongodb
```

**NGINX Configuration Error**

```bash
# Test configuration
sudo nginx -t -c $(pwd)/nginx/nginx.conf -p $(pwd)/nginx/

# Check syntax errors in nginx.conf
```

**Service Not Responding**

```bash
# Check if ports are available
lsof -ti tcp:3000,3001,3002

# Kill processes if needed
./scripts/stop-services.sh
```

**Domain Resolution Issues**

```bash
# Verify /etc/hosts entry
grep "local.a.com" /etc/hosts

# Should show: 127.0.0.1 local.a.com
```

### Support

For additional help:

1. Check the [docs/SETUP.md](docs/SETUP.md) for detailed setup
2. Review logs in `nginx/logs/` directory
3. Use `./scripts/check-status.sh` for system diagnostics
4. Create an issue with error logs and system information

---

**Built with ❤️ for demonstrating production-ready SSO architecture**
