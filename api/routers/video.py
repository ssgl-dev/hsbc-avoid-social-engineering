"""Video selection API endpoints."""
from fastapi import APIRouter, HTTPException, Depends
from api.utils.video_handler import HashTableRequestHandler
from pydantic import BaseModel
from typing import Optional, List
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/video-selector", tags=["video_selector"])

class VideoSelectionRequest(BaseModel):
    source: str
    page_title: Optional[str] = ""

handler = HashTableRequestHandler()
@router.post("/select")
async def select_video(request: VideoSelectionRequest):
    """
    Main endpoint to select videos by text content.
    """
    global handler
    # print(handler)
    print('2select video called')
    try:
        if not handler:
            print('initializing handler')
            handler = HashTableRequestHandler()
            print('handler initialized')
        # print(request)
        # print(request.page_title)
        video_source = handler.get_source(request.source, request.page_title)
        
        if video_source:
            # JSONResponse({"success": True, "message": "Login successful"})
            print(1)
            return JSONResponse({
                "success": True,
                "video_source": video_source,
                "match_type": "exact"
            })
        print(2)
        return JSONResponse({
            "success": False,
            "video_source": None,
            "message": "Not found",
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error! selecting video: {str(e)}")