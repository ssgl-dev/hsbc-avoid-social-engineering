#!/usr/bin/env bash
set -euo pipefail

# Check status of production deployment: FastAPI app and Nginx

echo "==> Production Services Status"
echo ""

# Check FastAPI app
echo "FastAPI Application (hsbc-poc):"
if systemctl is-active --quiet hsbc-poc 2>/dev/null; then
  echo "  Status: ✓ Running"
  systemctl status hsbc-poc --no-pager -l | grep -E "Active:|Main PID:|Memory:|CPU:" | sed 's/^/  /'
else
  echo "  Status: ✗ Not running"
fi

echo ""

# Check Nginx
echo "Nginx:"
if systemctl is-active --quiet nginx 2>/dev/null; then
  echo "  Status: ✓ Running"
  systemctl status nginx --no-pager -l | grep -E "Active:|Main PID:|Memory:|CPU:" | sed 's/^/  /'
else
  echo "  Status: ✗ Not running"
fi

echo ""

# Check if app is responding
echo "Application Health Check:"
if curl -sf -o /dev/null http://127.0.0.1:8000 2>/dev/null; then
  echo "  ✓ FastAPI responding on http://127.0.0.1:8000"
else
  echo "  ✗ FastAPI not responding on http://127.0.0.1:8000"
fi

if curl -sf -o /dev/null http://127.0.0.1:80 2>/dev/null; then
  echo "  ✓ Nginx responding on http://127.0.0.1:80"
else
  echo "  ✗ Nginx not responding on http://127.0.0.1:80"
fi

if curl -sf -o /dev/null https://hksl.ai 2>/dev/null; then
  echo "  ✓ HTTPS site responding at https://hksl.ai"
else
  echo "  ✗ HTTPS site not responding at https://hksl.ai"
fi

echo ""

# Check listening ports
echo "Listening Ports:"
ss -tlnp | grep -E ":(80|443|8000)\s" | sed 's/^/  /' || echo "  No services listening on expected ports"
