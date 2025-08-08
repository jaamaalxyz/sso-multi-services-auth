#!/bin/bash
# =============================================================================
# Stop All Services Script for SSO Multi-Service
# =============================================================================

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "🛑 Stopping SSO Multi-Service Architecture"
echo "============================================"

# Function to kill processes by port
kill_port() {
    local port=$1
    local pids
    pids=$(lsof -ti tcp:$port 2>/dev/null) || true
    if [ -n "$pids" ]; then
        echo "🔧 Stopping process on port $port (PIDs: $pids)..."
        kill $pids 2>/dev/null || true
        sleep 2
        # Force kill if still running
        pids=$(lsof -ti tcp:$port 2>/dev/null) || true
        if [ -n "$pids" ]; then
            echo "   Force killing process on port $port..."
            kill -9 $pids 2>/dev/null || true
        fi
    fi
}

# Stop services by PID files first (cleaner)
for svc in a b c; do
    pid_file="$PROJECT_ROOT/.service_${svc}.pid"
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "🛑 Stopping service-$svc (PID $pid)..."
            kill "$pid" 2>/dev/null || true
        fi
        rm -f "$pid_file"
    fi
done

# Wait a moment for graceful shutdown
sleep 3

# Kill remaining processes by ports
echo "🧹 Cleaning up remaining processes..."
kill_port 3000
kill_port 3001 
kill_port 3002

# Stop NGINX
if pgrep nginx >/dev/null; then
    echo "🛑 Stopping NGINX..."
    sudo nginx -s quit 2>/dev/null || sudo pkill nginx
    sleep 2
    
    # Check if NGINX is really stopped
    if pgrep nginx >/dev/null; then
        echo "   Force stopping NGINX..."
        sudo pkill -9 nginx 2>/dev/null || true
    fi
    echo "✅ NGINX stopped"
else
    echo "ℹ️  NGINX is not running"
fi

# Clean up any remaining PID files
rm -f "$PROJECT_ROOT"/.service_*.pid

echo ""
echo "✅ All services stopped successfully!"
echo "============================================"