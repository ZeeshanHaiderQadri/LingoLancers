"""
Research Agent for Blog Writing Team
Uses Tavily API to gather research data from web sources
Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
"""
import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from tavily import TavilyClient
import asyncio


@dataclass
class BlogRequest:
    """Blog creation request from user"""
    topic: Optional[str] = None
    reference_urls: Optional[List[str]] = None
    target_keywords: Optional[List[str]] = None
    tone: str = 'professional'
    length: str = 'medium'
    publish_to: Optional[List[str]] = None


@dataclass
class ResearchResult:
    """Result from research agent"""
    query: str
    sources: List[Dict[str, Any]]
    insights: List[str]
    key_points: List[str]
    reference_analysis: Optional[List[Dict[str, Any]]] = None
    total_sources: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'query': self.query,
            'sources': self.sources,
            'insights': self.insights,
            'key_points': self.key_points,
            'reference_analysis': self.reference_analysis,
            'total_sources': self.total_sources
        }


class ResearchAgentError(Exception):
    """Base exception for research agent errors"""
    pass


class TavilyAPIError(ResearchAgentError):
    """Raised when Tavily API fails"""
    pass


class ResearchAgent:
    """
    Research agent using Tavily API
    Gathers research data from web sources for blog article creation
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize research agent
        
        Args:
            api_key: Tavily API key. If None, reads from TAVILY_API_KEY env var
            
        Raises:
            ResearchAgentError: If API key is not provided or found
        """
        if api_key is None:
            api_key = os.getenv("TAVILY_API_KEY")
        
        if not api_key:
            raise ResearchAgentError(
                "Tavily API key not found. Set TAVILY_API_KEY environment variable or pass key to constructor."
            )
        
        self.tavily_client = TavilyClient(api_key=api_key)
        self.max_results = 10
        self.search_depth = "advanced"
    
    async def execute(self, request: BlogRequest, workflow_id: Optional[str] = None) -> ResearchResult:
        """
        Gather research data from web sources
        
        Args:
            request: Blog creation request with topic and/or reference URLs
            workflow_id: Optional workflow ID for progress updates
            
        Returns:
            ResearchResult with sources, insights, and key points
            
        Raises:
            ResearchAgentError: If research fails
            TavilyAPIError: If Tavily API call fails
        """
        try:
            # Get WebSocket manager for progress updates
            ws_manager = None
            if workflow_id:
                try:
                    from blog_team.api.websocket_manager import get_connection_manager
                    ws_manager = get_connection_manager()
                except ImportError:
                    pass
            
            # Build search query from request
            query = self._build_query(request)
            
            # Send search progress
            if ws_manager and workflow_id:
                await ws_manager.send_agent_search(
                    workflow_id=workflow_id,
                    agent_name='research',
                    query=query,
                    source='Web Search',
                    source_count=0
                )
            
            # Search with Tavily
            search_results = await self._search_tavily(query, ws_manager, workflow_id)
            
            # Send analysis progress
            if ws_manager and workflow_id:
                await ws_manager.send_agent_detailed_progress(
                    workflow_id=workflow_id,
                    agent_name='research',
                    progress_percentage=60,
                    message=f"Analyzing {len(search_results.get('results', []))} sources found",
                    work_type='analysis',
                    details={
                        'title': 'Source Analysis',
                        'content': f'Processing {len(search_results.get("results", []))} web sources for insights and key information',
                        'metadata': {
                            'sources_found': len(search_results.get('results', [])),
                            'query_used': query
                        }
                    }
                )
            
            # Extract insights from search results
            insights = self._extract_insights(search_results)
            
            # Extract key points
            key_points = self._extract_key_points(insights, search_results)
            
            # Analyze reference URLs if provided
            reference_analysis = None
            if request.reference_urls:
                if ws_manager and workflow_id:
                    await ws_manager.send_agent_detailed_progress(
                        workflow_id=workflow_id,
                        agent_name='research',
                        progress_percentage=80,
                        message=f"Analyzing {len(request.reference_urls)} reference URLs",
                        work_type='search',
                        details={
                            'title': 'Reference URL Analysis',
                            'content': f'Deep-diving into {len(request.reference_urls)} provided reference URLs for additional context',
                            'metadata': {
                                'reference_count': len(request.reference_urls)
                            }
                        }
                    )
                
                reference_analysis = await self._analyze_reference_urls(request.reference_urls)
                # Add reference insights to main insights
                for ref in reference_analysis:
                    if ref.get('content'):
                        insights.append(f"From {ref['url']}: {ref['content'][:200]}...")
            
            # Final compilation with all sources
            if ws_manager and workflow_id:
                # Include all sources in final compilation
                all_sources = []
                for source in search_results.get('results', []):
                    all_sources.append({
                        'title': source.get('title', 'Untitled'),
                        'url': source.get('url', ''),
                        'content': source.get('content', '')[:150] + '...' if source.get('content') else ''
                    })
                
                await ws_manager.send_agent_detailed_progress(
                    workflow_id=workflow_id,
                    agent_name='research',
                    progress_percentage=95,
                    message="Compiling research findings",
                    work_type='compilation',
                    details={
                        'title': 'Research Compilation Complete',
                        'content': f'Research complete! Found {len(all_sources)} sources, extracted {len(insights)} insights and {len(key_points)} key points for your article.',
                        'metadata': {
                            'insights_count': len(insights),
                            'key_points_count': len(key_points),
                            'total_sources': len(search_results.get('results', [])),
                            'sources': all_sources
                        }
                    }
                )
            
            return ResearchResult(
                query=query,
                sources=search_results.get('results', []),
                insights=insights,
                key_points=key_points,
                reference_analysis=reference_analysis,
                total_sources=len(search_results.get('results', []))
            )
            
        except Exception as e:
            if isinstance(e, (ResearchAgentError, TavilyAPIError)):
                raise
            raise ResearchAgentError(f"Research execution failed: {e}")
    
    def _build_query(self, request: BlogRequest) -> str:
        """
        Build search query from blog request
        
        Args:
            request: Blog creation request
            
        Returns:
            Search query string
        """
        query_parts = []
        
        # Add topic if provided
        if request.topic:
            query_parts.append(request.topic)
        
        # Add target keywords if provided
        if request.target_keywords:
            query_parts.extend(request.target_keywords[:3])  # Limit to top 3 keywords
        
        # If no topic or keywords, use a default
        if not query_parts:
            query_parts.append("blog article ideas")
        
        return " ".join(query_parts)
    
    async def _search_tavily(self, query: str, ws_manager=None, workflow_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Search using Tavily API
        
        Args:
            query: Search query string
            ws_manager: WebSocket manager for progress updates
            workflow_id: Workflow ID for progress updates
            
        Returns:
            Tavily search results
            
        Raises:
            TavilyAPIError: If API call fails
        """
        try:
            # Send search start progress
            if ws_manager and workflow_id:
                await ws_manager.send_agent_detailed_progress(
                    workflow_id=workflow_id,
                    agent_name='research',
                    progress_percentage=20,
                    message=f"Searching web for: {query}",
                    work_type='search',
                    details={
                        'title': f'Web Search: {query}',
                        'content': f'Executing comprehensive web search using Tavily API with advanced depth',
                        'metadata': {
                            'search_depth': self.search_depth,
                            'max_results': self.max_results
                        }
                    }
                )
            
            # Run Tavily search in thread pool (it's synchronous)
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None,
                lambda: self.tavily_client.search(
                    query=query,
                    search_depth=self.search_depth,
                    max_results=self.max_results,
                    include_answer=True,
                    include_raw_content=False
                )
            )
            
            # Send search completion progress with actual sources
            if ws_manager and workflow_id:
                sources_found = len(results.get('results', []))
                # Format sources for display
                formatted_sources = []
                for source in results.get('results', [])[:10]:  # Limit to 10 sources
                    formatted_sources.append({
                        'title': source.get('title', 'Untitled'),
                        'url': source.get('url', ''),
                        'content': source.get('content', '')[:100] + '...' if source.get('content') else ''
                    })
                
                await ws_manager.send_agent_detailed_progress(
                    workflow_id=workflow_id,
                    agent_name='research',
                    progress_percentage=40,
                    message=f"Found {sources_found} relevant sources",
                    work_type='search',
                    details={
                        'title': f'Search Complete: {sources_found} Sources Found',
                        'content': f'Successfully retrieved {sources_found} high-quality sources from web search',
                        'metadata': {
                            'sources_found': sources_found,
                            'has_answer': bool(results.get('answer')),
                            'query_executed': query,
                            'sources': formatted_sources
                        }
                    }
                )
            
            return results
            
        except Exception as e:
            raise TavilyAPIError(f"Tavily API search failed: {e}")
    
    def _extract_insights(self, search_results: Dict[str, Any]) -> List[str]:
        """
        Extract insights from search results
        
        Args:
            search_results: Tavily search results
            
        Returns:
            List of insight strings
        """
        insights = []
        
        # Add Tavily's answer if available
        if search_results.get('answer'):
            insights.append(f"Key insight: {search_results['answer']}")
        
        # Extract content from each result
        for result in search_results.get('results', []):
            if result.get('content'):
                # Take first 300 characters as insight
                content = result['content'][:300]
                if len(result['content']) > 300:
                    content += "..."
                insights.append(content)
        
        return insights
    
    def _extract_key_points(
        self, 
        insights: List[str], 
        search_results: Dict[str, Any]
    ) -> List[str]:
        """
        Extract key points from insights and search results
        
        Args:
            insights: List of insight strings
            search_results: Tavily search results
            
        Returns:
            List of key point strings
        """
        key_points = []
        
        # Use Tavily answer as first key point
        if search_results.get('answer'):
            key_points.append(search_results['answer'])
        
        # Extract titles as key points
        for result in search_results.get('results', [])[:5]:  # Top 5 results
            if result.get('title'):
                key_points.append(result['title'])
        
        return key_points
    
    async def _analyze_reference_urls(self, urls: List[str]) -> List[Dict[str, Any]]:
        """
        Analyze reference URLs using Tavily
        
        Args:
            urls: List of reference URLs to analyze
            
        Returns:
            List of analysis results for each URL
        """
        analyses = []
        
        for url in urls:
            try:
                # Use Tavily to extract content from URL
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None,
                    lambda: self.tavily_client.extract(urls=[url])
                )
                
                if result and result.get('results'):
                    url_data = result['results'][0]
                    analyses.append({
                        'url': url,
                        'title': url_data.get('title', ''),
                        'content': url_data.get('raw_content', '')[:500],  # First 500 chars
                        'success': True
                    })
                else:
                    analyses.append({
                        'url': url,
                        'error': 'No content extracted',
                        'success': False
                    })
                    
            except Exception as e:
                analyses.append({
                    'url': url,
                    'error': str(e),
                    'success': False
                })
        
        return analyses
    
    def get_source_urls(self, result: ResearchResult) -> List[str]:
        """
        Extract source URLs from research result
        
        Args:
            result: Research result
            
        Returns:
            List of source URLs
        """
        return [source.get('url', '') for source in result.sources if source.get('url')]
    
    def get_source_titles(self, result: ResearchResult) -> List[str]:
        """
        Extract source titles from research result
        
        Args:
            result: Research result
            
        Returns:
            List of source titles
        """
        return [source.get('title', '') for source in result.sources if source.get('title')]
