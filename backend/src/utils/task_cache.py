"""
Task Cache to prevent duplicate processing and infinite loops
"""

import hashlib
import time
from typing import Dict, Any, Optional

class TaskCache:
    """Simple in-memory cache to prevent duplicate task processing"""
    
    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.expiry_time = 300  # 5 minutes
    
    def _generate_key(self, request: str, team_domain: str) -> str:
        """Generate a unique key for the request"""
        content = f"{team_domain}:{request}".lower().strip()
        return hashlib.md5(content.encode()).hexdigest()
    
    def is_duplicate(self, request: str, team_domain: str) -> bool:
        """Check if this request is a duplicate"""
        key = self._generate_key(request, team_domain)
        
        if key in self.cache:
            cached_time = self.cache[key].get('timestamp', 0)
            # Check if cache entry is still valid (not expired)
            if time.time() - cached_time < self.expiry_time:
                return True
            else:
                # Remove expired entry
                del self.cache[key]
        
        return False
    
    def add_request(self, request: str, team_domain: str, result: Any = None) -> None:
        """Add a request to the cache"""
        key = self._generate_key(request, team_domain)
        self.cache[key] = {
            'request': request,
            'team_domain': team_domain,
            'result': result,
            'timestamp': time.time()
        }
    
    def get_cached_result(self, request: str, team_domain: str) -> Optional[Any]:
        """Get cached result if available"""
        key = self._generate_key(request, team_domain)
        
        if key in self.cache:
            cached_time = self.cache[key].get('timestamp', 0)
            if time.time() - cached_time < self.expiry_time:
                return self.cache[key].get('result')
            else:
                # Remove expired entry
                del self.cache[key]
        
        return None
    
    def clear_expired(self) -> None:
        """Clear expired cache entries"""
        current_time = time.time()
        expired_keys = [
            key for key, data in self.cache.items()
            if current_time - data.get('timestamp', 0) > self.expiry_time
        ]
        
        for key in expired_keys:
            del self.cache[key]
    
    def clear_all(self) -> None:
        """Clear all cache entries"""
        self.cache.clear()

# Global task cache instance
task_cache = TaskCache()