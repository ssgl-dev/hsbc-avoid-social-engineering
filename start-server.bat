@echo off
REM Use project's venv python if present, else fallback to system python
if exist ".venv\Scripts\python.exe" (
    set "PY=.venv\Scripts\python.exe"
) else (
    set "PY=python"
)

echo Starting FastAPI server on http://localhost:8000 ...
"%PY%" -m uvicorn server:app --reload --host localhost --port 8000