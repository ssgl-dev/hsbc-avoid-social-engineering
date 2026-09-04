""" Requests for tasks related to video player functionality in the frontend. """

import hashlib
from typing import Optional, Dict, Any
import json
from datetime import datetime, UTC
from fastapi import HTTPException
import httpx  
from api.utils.excel_helper import ExcelHelper

class HashTableRequestHandler: 
    def __init__(self, initial_data: Optional[Dict[str,str]] = None):
        """
        Initialize the request handler with optional initial data.
        Args:
            initial_data (Optional[Dict[str,str]]): Dictionary of Initial Key-Value pairs.
        """
        print("Initializing HashTableRequestHandler...")
        self.hash_table = initial_data.copy() if initial_data else {}
        self.client = httpx.AsyncClient()
        self.excel_helper: Optional[ExcelHelper] = None
        # todo: make excel_path configurable
        print("Loading workbook...")
        excel_path = "./hsbc_page_index.xlsx"
        self.excel_helper = ExcelHelper(excel_path)

    def close_workbook(self):
        """Close workbook if opened via helper."""
        if self.excel_helper:
            self.excel_helper.close()
            self.excel_helper = None

    def _generate_hash_key(self, text: str) -> str:
        """
        Generate a hash key from the input text
        Args:
            text: Input text to hash
        Returns:
            SHA-256 hash of the text
        """
        return hashlib.sha256(text.encode()).hexdigest()

    def store_data(self, text: str, source: str) -> str:
        """
        Store text and its corresponding source in the hash table
        Args:
            text: The text to store
            source: The source associated with the text
        Returns:
            The hash key generated for the text
        """
        hash_key = self._generate_hash_key(text)
        self.hash_table[hash_key] = {
            'source': source,
            'original_text': text,
            'timestamp': datetime.now(UTC).isoformat()
        }
        
        return hash_key

    def get_source(self, text: str, page_title: str = '') -> Optional[Dict[str, Any]]:
        """
        Retrieve the source for a given text
        Args:
            text: The text to look up
        Returns:
            Dictionary containing source information or None if not found
        """
        # print("Getting source for text:", text, "with page title:", page_title)
        hash_key = self._generate_hash_key(text)
        #return self.hash_table.get(hash_key)
        sheet_name = self.find_sheet_name_by_title(page_title)
        print(sheet_name)
        result = self.find_index_for_translation(sheet_name, text)
        if result == None:
            result = self.find_index_for_translation("Sheet1", text)
        print(result)
        if (result != None):
            return "/static/videos/" + result + ".mp4"
        return "/static/videos/stub.webm"

    def _create_error_response(self, message: str) -> Dict[str, Any]:
        """Create error response"""
        return {
            'status': 'error',
            'message': message
        }

    # Proxy to ExcelHelper
    def find_index_for_translation(self, sheet_name: str, text: str) -> Optional[str]:
        if not self.excel_helper:
            raise ValueError("Workbook not loaded. Provide excel_path when initializing HashTableRequestHandler.")
        return self.excel_helper.find_index_for_translation(sheet_name, text)

    # Find sheet name by page title
    def find_sheet_name_by_title(self, title: str) -> Optional[str]:
        if not self.excel_helper:
            raise ValueError("Workbook not loaded. Provide excel_path when initializing HashTableRequestHandler.")
        return self.excel_helper.find_sheet_name_by_title(title)

    async def handle_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main method to handle frontend requests
        Args:
            request_data: Dictionary containing request parameters
        Returns:
            Response dictionary with status and data
        """

        text = request_data.get('text')
        source = request_data.get('source', 'unknown')

        if not text:
            return self._create_error_response("Text is required for processing.")

        hash_key = self.store_data(text, source)
        source_data = self.get_source(text)

        response = {
            'status': 'success',
            'hash_key': hash_key,
            'source': source_data
        }
        return response

    async def close_client(self):
        """Close the HTTP client when done"""
        await self.client.aclose()

    async def fetch_external_data(self, url: str) -> Dict[str, Any]:
        """Example method to fetch data from external API"""
        try:
            response = await self.client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"External API error: {str(e)}")
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="External API returned error")

