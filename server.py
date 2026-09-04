from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import mimetypes
from pathlib import Path
from gettext import translation, NullTranslations
from api.routers import include_routers
from api.routers.pages import render
import signal
import threading

shutdown_reason = {"signal": None}

def _handle_signal(sig, frame):
    shutdown_reason["signal"] = sig
    print(f"[signal] Received {signal.Signals(sig).name}, initiating shutdown...")

signal.signal(signal.SIGTERM, _handle_signal)
signal.signal(signal.SIGINT, _handle_signal)

app = FastAPI()

# Include routers
include_routers(app)

BASE_DIR = Path(__file__).resolve().parent
VIDEO_ROOT = (BASE_DIR / "frontend" / "assets" / "videos").resolve()


def _parse_video_range(range_header: str, file_size: int):
    if not range_header or not range_header.startswith("bytes="):
        return None
    spec = range_header[len("bytes="):].split(",", 1)[0].strip()
    if "-" not in spec:
        return None
    start_text, end_text = spec.split("-", 1)
    try:
        if start_text == "":
            suffix_length = int(end_text)
            start = max(0, file_size - suffix_length)
            end = file_size - 1
        else:
            start = int(start_text)
            end = int(end_text) if end_text else file_size - 1
    except ValueError:
        return None
    if start < 0 or start >= file_size or end < start:
        return None
    return start, min(end, file_size - 1)


@app.get("/static/videos/{name}")
async def stream_video(name: str, request: Request):
    video_path = (VIDEO_ROOT / name).resolve()
    try:
        video_path.relative_to(VIDEO_ROOT)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")
    if not video_path.is_file():
        raise HTTPException(status_code=404, detail="Not found")

    file_size = video_path.stat().st_size
    parsed_range = _parse_video_range(request.headers.get("range"), file_size)
    if parsed_range is None:
        start, end = 0, file_size - 1
        status_code = 200
    else:
        start, end = parsed_range
        status_code = 206

    length = end - start + 1
    media_type = mimetypes.guess_type(name)[0] or "video/mp4"
    headers = {
        "Accept-Ranges": "bytes",
        "Content-Length": str(length),
        "Content-Type": media_type,
        "Cache-Control": "public, max-age=31536000",
    }
    if status_code == 206:
        headers["Content-Range"] = f"bytes {start}-{end}/{file_size}"

    async def video_chunks():
        chunk_size = 1024 * 1024
        remaining = length
        with video_path.open("rb") as handle:
            handle.seek(start)
            while remaining > 0:
                data = handle.read(min(chunk_size, remaining))
                if not data:
                    break
                remaining -= len(data)
                yield data

    return StreamingResponse(video_chunks(), status_code=status_code, headers=headers)


# Mount static assets only in development
if True:
    # Mount static assets (corrected to serve from frontend/assets)
    app.mount("/static", StaticFiles(directory="frontend/assets"), name="static")
    # Mount assets separately for auth-guard.js and other assets
    app.mount("/assets", StaticFiles(directory="frontend/assets"), name="assets")

@app.on_event("startup")
async def startup_event():
    print("Registered routes:")
    for route in app.routes:
        if hasattr(route, "path"):
            print(f"  {route.path}")


@app.get("/set-lang")
def set_language(lang: str = "en", next: str = "/"):
    """Set language cookie then redirect back to the given path."""
    response = RedirectResponse(url=next or "/")
    response.set_cookie(key="lang", value=lang, max_age=60*60*24*365, path="/")
    return response

if __name__ == "__main__":
    # Determine host and port for running the server. Use 0.0.0.0 so the
    # service is reachable from outside (e.g., via domain hksl.ai pointing to the host IP).
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    uvicorn.run("server:app", host=host, port=port, reload=reload)
