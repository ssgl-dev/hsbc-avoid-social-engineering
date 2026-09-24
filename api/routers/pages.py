"""Pages router for the Avoid Social Engineering Scams standalone project."""
from fastapi import APIRouter, Form, Request
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse

from api.utils.render import render


router = APIRouter(prefix="", tags=["pages"])

AUTH_CREDENTIALS = {
    "HSBCFintech2025": "GlassboxAI2025",
}
AUTH_COOKIE = "auth_token_avoid"


@router.get("/login.html", response_class=HTMLResponse)
@router.get("/login", response_class=HTMLResponse)
async def login_page():
    response = FileResponse("frontend/login.html")
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@router.post("/api/login")
async def login(username: str = Form(...), password: str = Form(...)):
    if username in AUTH_CREDENTIALS and AUTH_CREDENTIALS[username] == password:
        response = JSONResponse({"success": True, "message": "Login successful"})
        response.set_cookie(key=AUTH_COOKIE, value=f"authenticated_{username}", httponly=True)
        return response
    return JSONResponse({"success": False, "message": "Invalid credentials"}, status_code=401)


@router.post("/api/logout")
async def logout():
    response = JSONResponse({"success": True, "message": "Logged out successfully"})
    response.delete_cookie(key=AUTH_COOKIE)
    return response


@router.get("/", response_class=HTMLResponse)
async def root(request: Request):
    target = "/portal" if request.cookies.get(AUTH_COOKIE, "").startswith("authenticated_") else "/login.html?v=20260924"
    response = RedirectResponse(target, status_code=303)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@router.get("/portal", response_class=HTMLResponse)
@router.get("/portal.html", response_class=HTMLResponse)
async def portal_page():
    return FileResponse("frontend/portal.html")


def _register_additional_page_routes(
    route_slug: str,
    cn_template: str,
    en_template: str,
) -> None:
    @router.get(f"/{route_slug}", response_class=HTMLResponse)
    async def page_default(request: Request):
        return render(cn_template, request, language="en")

    @router.get(f"/{route_slug}/en", response_class=HTMLResponse)
    async def page_en(request: Request):
        return render(en_template, request, language="en")

    @router.get(f"/{route_slug}/sc", response_class=HTMLResponse)
    async def page_sc(request: Request):
        return render(cn_template, request, language="sc")


for _page in [
    (
        "prevent-fraud",
        "Prevent Fraud _ Cyber Security And Fraud - HSBC HK CN.html",
        "Prevent Fraud _ Cyber Security And Fraud - HSBC HK.html",
    ),
    (
        "investment-scams",
        "How Investment Scams Work And How To Avoid Them - HSBC HK CN.html",
        "How Investment Scams Work And How To Avoid Them - HSBC HK.html",
    ),
    (
        "job-scams",
        "How To Avoid Job Scams _ Cyber Security And Fraud - HSBC HK CN.html",
        "How To Avoid Job Scams _ Cyber Security And Fraud - HSBC HK.html",
    ),
    (
        "instant-messaging-app-scams",
        "Stay Aware Of WhatsApp And Instagram Scams - HSBC HK CN.html",
        "Stay Aware Of WhatsApp And Instagram Scams - HSBC HK.html",
    ),
    (
        "romance-scams",
        "Romance Scams _ Cyber Security And Fraud - HSBC HK CN.html",
        "Romance Scams _ Cyber Security And Fraud - HSBC HK.html",
    ),
    (
        "passwords",
        "How to set a strong password _ Cyber security and fraud - HSBC HK CN.html",
        "How to set a strong password _ Cyber security and fraud - HSBC HK.html",
    ),
]:
    _register_additional_page_routes(*_page)
