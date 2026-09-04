import os
from gettext import translation, NullTranslations
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Set up Jinja2 templates
templates = Jinja2Templates(directory="frontend/templates")
# Enable Jinja2 i18n extension so `{% trans %}` works
templates.env.add_extension('jinja2.ext.i18n')


def render(name: str, request: Request, context: dict | None = None, language: str | None = None) -> HTMLResponse:
    """Helper to render a template with i18n based on ?lang=xx or cookie (default en)."""
    lang = request.query_params.get('lang') or request.cookies.get('lang') or language or "en"
    _install_translations_for(name, lang)
    ctx = {"request": request, "current_lang": lang}
    if context:
        ctx.update(context)
    return templates.TemplateResponse(name, ctx)

def _install_translations_for(template_name: str, lang: str = "en") -> None:
    """Install gettext translations for the given template and language.
    
    Use the template filename as the gettext domain,
    matching the existing per-page .mo files under `translations/<lang>/LC_MESSAGES/`.
    """
    langs = [lang] if lang == "en" else ["zh"]
    try:
        trans = translation(domain='messages', localedir='translations', languages=langs)
    except Exception:
        trans = NullTranslations()  # no translations available for this domain/language
    templates.env.install_gettext_translations(trans, newstyle=True)