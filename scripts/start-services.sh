#!/bin/bash
# =============================================================================
# Start All Services Script for SSO Multi-Service
# =============================================================================

set -e # Exit on any error

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "🚀 Starting SSO Multi-Service Architecture"
echo "============================================="

# Function to kill process by port
kill_port() {
    local port=$1
    local pids
    pids=$(lsof -ti tcp:$port 2>/dev/null) || true
    if [ -n "$pids" ]; then
        echo "🔧 Killing existing process on port $port (PIDs: $pids)..."
        kill -9 $pids 2>/dev/null || true
        sleep 1
    fi
}

echo "🧹 Cleaning up old processes..."

# Kill by PID files
for svc in a b c; do
    pid_file="$PROJECT_ROOT/.service_${svc}.pid"
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        echo "   Stopping old service-$svc (PID $pid)..."
        kill "$pid" 2>/dev/null || true
        rm -f "$pid_file"
    fi
done

# Kill processes on our ports
kill_port 3000
kill_port 3001
kill_port 3002

# Stop nginx if running
if pgrep nginx >/dev/null; then
    echo "🛑 Stopping existing NGINX..."
    sudo nginx -s quit 2>/dev/null || sudo pkill nginx
    sleep 2
fi

echo ""
echo "🚀 Starting services..."

# Check if MongoDB is running
if ! pgrep mongod > /dev/null; then
    echo "⚠️  MongoDB doesn't appear to be running"
    echo "   Start it with: brew services start mongodb-community"
    echo "   Continuing anyway..."
fi

# Start Service A (Main Auth Service)
echo "📍 Starting Service A (Port 3000) - Main Auth Service..."
( cd "$PROJECT_ROOT/service-a" && npm run dev -- -p 3000 ) &
SERVICE_A_PID=$!

# Start Service B (Secondary Service)
echo "📍 Starting Service B (Port 3001) - Secondary Service..."
( cd "$PROJECT_ROOT/service-b" && npm run dev -- -p 3001 ) &
SERVICE_B_PID=$!

# Start Service C (Secondary Service)
echo "📍 Starting Service C (Port 3002) - Secondary Service..."
( cd "$PROJECT_ROOT/service-c" && npm run dev -- -p 3002 ) &
SERVICE_C_PID=$!

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 8

# Check if services are responding
echo "🔍 Checking service health..."
for i in {1..10}; do
    if curl -s http://localhost:3000 > /dev/null && \
       curl -s http://localhost:3001 > /dev/null && \
       curl -s http://localhost:3002 > /dev/null; then
        echo "✅ All services are responding"
        break
    else
        if [ $i -eq 10 ]; then
            echo "⚠️  Some services may not be ready yet"
            echo "   Check individual services manually if needed"
        else
            echo "   Waiting for services... ($i/10)"
            sleep 2
        fi
    fi
done

# Create logs directory for NGINX
mkdir -p "$PROJECT_ROOT/nginx/logs"

# Start NGINX with our custom configuration
echo ""
echo "🌐 Starting NGINX reverse proxy..."
if sudo nginx -t -c "$PROJECT_ROOT/nginx/nginx.conf" -p "$PROJECT_ROOT/nginx/" > /dev/null 2>&1; then
    sudo nginx -c "$PROJECT_ROOT/nginx/nginx.conf" -p "$PROJECT_ROOT/nginx/"
    echo "✅ NGINX started successfully"
else
    echo "❌ NGINX configuration test failed"
    echo "   Check your nginx/nginx.conf file"
    # Continue without NGINX - services still accessible via localhost
fi

# Save PIDs for cleanup
echo "$SERVICE_A_PID" > "$PROJECT_ROOT/.service_a.pid"
echo "$SERVICE_B_PID" > "$PROJECT_ROOT/.service_b.pid"
echo "$SERVICE_C_PID" > "$PROJECT_ROOT/.service_c.pid"

echo ""
echo "🎉 All services started successfully!"
echo "============================================="
echo "🌐 Access your SSO application:"
echo ""
echo "   🏠 Service A (Main):      http://local.a.com/"
echo "   🏢 Service B (Secondary): http://local.a.com/b/"
echo "   🏭 Service C (Secondary): http://local.a.com/c/"
echo "   💚 Health Check:         http://local.a.com/health"
echo ""
echo "🧪 Direct service access (for debugging):"
echo "   📍 Service A: http://localhost:3000"
echo "   📍 Service B: http://localhost:3001"
echo "   📍 Service C: http://localhost:3002"
echo ""
echo "📊 Monitor services:"
echo "   ./scripts/check-status.sh"
echo ""
echo "🛑 Stop all services:"
echo "   ./scripts/stop-services.sh"
echo "============================================="