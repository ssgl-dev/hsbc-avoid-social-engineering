"""Router Registration for API endpoints."""
from fastapi import FastAPI

def include_routers(app: FastAPI) -> None: 
    """ Attach all API routers to the FastAPI app.
    
    Args:
        app (FastAPI): The FastAPI application instance
     """

    from api.routers import video
    from api.routers import pages

    app.include_router(video.router)
    app.include_router(pages.router)
    
