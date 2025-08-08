#!/bin/bash
# =============================================================================
# Status Check Script for SSO Multi-Service
# =============================================================================

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "📊 SSO Multi-Service Status Report"
echo "============================================"

# Check MongoDB
echo "🗄️  Database Status:"
if pgrep mongod > /dev/null; then
    echo "   ✅ MongoDB is running"
else
    echo "   ❌ MongoDB is not running"
    echo "      Start with: brew services start mongodb-community"
fi

echo ""

# Check Backend Services
echo "🚀 Backend Services Status:"

services=("3000:Service A (Main Auth)" "3001:Service B (Secondary)" "3002:Service C (Secondary)")

for service in "${services[@]}"; do
    port="${service%%:*}"
    name="${service#*:}"
    
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        echo "   ✅ $name - http://localhost:$port"
    else
        echo "   ❌ $name - http://localhost:$port"
    fi
done

echo ""

# Check NGINX
echo "🌐 NGINX Reverse Proxy Status:"
if pgrep nginx > /dev/null; then
    echo "   ✅ NGINX is running"
    
    # Test endpoints
    endpoints=("/:Service A" "/b/:Service B" "/c/:Service C" "/health:Health Check")
    
    echo "   🔍 Testing endpoints:"
    for endpoint in "${endpoints[@]}"; do
        path="${endpoint%%:*}"
        name="${endpoint#*:}"
        
        if curl -s "http://local.a.com$path" > /dev/null 2>&1; then
            echo "      ✅ $name - http://local.a.com$path"
        else
            echo "      ❌ $name - http://local.a.com$path"
        fi
    done
else
    echo "   ❌ NGINX is not running"
fi

echo ""

# Check PID files
echo "📋 Process Management:"
for svc in a b c; do
    pid_file="$PROJECT_ROOT/.service_${svc}.pid"
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "   ✅ Service $svc PID file exists and process is running (PID: $pid)"
        else
            echo "   ⚠️  Service $svc PID file exists but process is not running (PID: $pid)"
        fi
    else
        echo "   ❌ Service $svc PID file not found"
    fi
done

echo ""

# Show recent NGINX logs if available
if [ -f "$PROJECT_ROOT/nginx/logs/access.log" ]; then
    echo "📋 Recent NGINX Access Log (last 3 entries):"
    tail -3 "$PROJECT_ROOT/nginx/logs/access.log" | sed 's/^/   /'
fi

echo ""
echo "============================================"
echo "🎯 Quick Actions:"
echo "   Start all:  ./scripts/start-services.sh"
echo "   Stop all:   ./scripts/stop-services.sh"
echo "   Check this: ./scripts/check-status.sh"
echo "============================================"