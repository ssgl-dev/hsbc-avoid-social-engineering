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
    return FileResponse("frontend/login.html")


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
    return RedirectResponse("/avoid-social-engineering-scams")


@router.get("/avoid-social-engineering-scams", response_class=HTMLResponse)
async def avoid_social_engineering_scams_page_cn(request: Request):
    return render(
        "Avoid social engineering scams _ Cyber security and fraud - HSBC HK CN.html",
        request,
        language="en",
    )


@router.get("/avoid-social-engineering-scams/en", response_class=HTMLResponse)
async def avoid_social_engineering_scams_page(request: Request):
    return render(
        "Avoid social engineering scams _ Cyber security and fraud - HSBC HK.html",
        request,
        language="en",
    )


@router.get("/credit-card-fraud-alert", response_class=HTMLResponse)
async def credit_card_fraud_alert_page_cn(request: Request):
    return render(
        "Preventing credit card fraud _ Cyber security and fraud - HSBC HK CN.html",
        request,
        language="en",
    )


@router.get("/credit-card-fraud-alert/en", response_class=HTMLResponse)
async def credit_card_fraud_alert_page(request: Request):
    return render(
        "Preventing credit card fraud _ Cyber security and fraud - HSBC HK.html",
        request,
        language="en",
    )
