"""
Tavily Search tool implementation for the Lingo Master Agent Backend
"""

from typing import Dict, Any, List
import os
import requests

class TavilySearchTool:
    """Tool for performing web searches using the Tavily API"""
    
    def __init__(self):
        self.name = "Tavily Search"
        self.description = "Advanced AI-powered search engine for comprehensive web research"
        self.api_key = None
        self.base_url = "https://api.tavily.com"
    
    def initialize(self) -> bool:
        """Initialize the Tavily Search tool"""
        try:
            self.api_key = os.getenv("TAVILY_API_KEY")
            if not self.api_key:
                print("Warning: TAVILY_API_KEY not found in environment variables")
                return False
            return True
        except Exception as e:
            print(f"Error initializing Tavily Search tool: {e}")
            return False
    
    def search(self, query: str, search_depth: str = "advanced", include_images: bool = False) -> Dict[str, Any]:
        """Perform a search using the Tavily API"""
        if not self.api_key:
            return {
                "success": False,
                "error": "Tool not properly initialized - missing API key"
            }
        
        try:
            # Prepare the request
            url = f"{self.base_url}/search"
            headers = {
                "Content-Type": "application/json"
            }
            payload = {
                "api_key": self.api_key,
                "query": query,
                "search_depth": search_depth,
                "include_images": include_images
            }
            
            # Make the request
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "results": data,
                    "query": query
                }
            else:
                return {
                    "success": False,
                    "error": f"API request failed with status {response.status_code}",
                    "details": response.text
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Error performing search: {str(e)}"
            }
    
    def get_search_context(self, query: str, max_results: int = 5) -> Dict[str, Any]:
        """Get contextual information for a search query"""
        search_result = self.search(query)
        
        if not search_result["success"]:
            return search_result
        
        # Extract relevant context from search results
        results = search_result["results"].get("results", [])
        context = []
        
        for i, result in enumerate(results[:max_results]):
            context.append({
                "rank": i + 1,
                "title": result.get("title", ""),
                "url": result.get("url", ""),
                "content": result.get("content", ""),
                "score": result.get("score", 0)
            })
        
        return {
            "success": True,
            "context": context,
            "query": query,
            "total_results": len(results)
        }

# Example usage
if __name__ == "__main__":
    # This would be used in a real implementation
    tool = TavilySearchTool()
    if tool.initialize():
        result = tool.search("best practices for UI/UX design")
        print(result)