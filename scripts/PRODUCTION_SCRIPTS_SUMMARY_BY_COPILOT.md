# Production Server Management Scripts

## Overview
Scripts to manage the HSBC POC production deployment (FastAPI + Nginx).

## Available Scripts

### 1. Start Production Services
```bash
./scripts/start-prod.sh
```
- Kills any existing uvicorn processes first
- Starts the FastAPI application via systemd service (hsbc-poc)
- Starts Nginx web server
- Shows status at the end

### 2. Stop Production Services
```bash
./scripts/stop-prod.sh
```
- Stops the FastAPI application (via systemd, PID file, or process search)
- Stops Nginx web server
- Cleans up PID files

### 3. Check Status
```bash
./scripts/status.sh
```
Shows:
- FastAPI service status (hsbc-poc)
- Nginx service status
- Health checks for all endpoints (http://127.0.0.1:8000, http://127.0.0.1:80, https://hksl.ai)
- Listening ports

### 4. Alternative Start (using venv directly)
```bash
./scripts/start-prod-venv.sh
```
- Starts FastAPI using the venv at `/opt/hsbc-poc/.venv` directly
- Does not use systemd
- Useful if systemd service is not available

## Environment Variables

### start-prod-venv.sh
- `HOST` - Bind address (default: 127.0.0.1)
- `PORT` - Port number (default: 8000)
- `WORKERS` - Number of worker processes (default: 4)
- `LOGFILE` - Log file path (default: app.log)
- `VENV_PATH` - Virtual environment path (default: /opt/hsbc-poc/.venv)

## Service Architecture

```
Internet → HTTPS (443) → Nginx → FastAPI (127.0.0.1:8000)
           HTTP (80)   → Nginx
```

- **Nginx**: Reverse proxy, SSL termination, static file serving
- **FastAPI**: Python application server (uvicorn with 4 workers)
- **Static files**: Served by Nginx from `/opt/hsbc-poc/frontend/assets/`

## Systemd Service

The FastAPI app runs as a systemd service:
```bash
sudo systemctl status hsbc-poc
sudo systemctl start hsbc-poc
sudo systemctl stop hsbc-poc
sudo systemctl restart hsbc-poc
sudo journalctl -u hsbc-poc -f  # Follow logs
```

## Troubleshooting

### Port 8000 already in use
The start script automatically detects and kills existing processes. If you still get this error:
```bash
sudo lsof -ti:8000 | xargs kill -9
```

### Check what's running
```bash
ps aux | grep uvicorn
ss -tlnp | grep -E ':(80|443|8000)'
```

### View logs
```bash
# Systemd service logs
journalctl -u hsbc-poc -n 50 --no-pager

# Nginx logs
tail -f /var/log/nginx/hsbc-poc-access.log
tail -f /var/log/nginx/hsbc-poc-error.log

# Script-based logs
tail -f /HSBC-POC/app.log
```

### Restart everything
```bash
./scripts/stop-prod.sh
sleep 2
./scripts/start-prod.sh
./scripts/status.sh
```

## Quick Reference

| Task | Command |
|------|---------|
| Start all | `./scripts/start-prod.sh` |
| Stop all | `./scripts/stop-prod.sh` |
| Check status | `./scripts/status.sh` |
| Restart | `./scripts/stop-prod.sh && ./scripts/start-prod.sh` |
| View logs | `journalctl -u hsbc-poc -f` |
| Test site | `curl -I https://hksl.ai` |

## Notes

- All scripts should be run from the `/HSBC-POC` directory
- Scripts require root/sudo access for systemd operations
- The FastAPI app runs with 4 workers for production load
- Nginx serves static files with 1-year caching
- TLS certificate is managed by Certbot and auto-renews
