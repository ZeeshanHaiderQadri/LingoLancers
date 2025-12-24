"""
Travel Planning Agents for Microsoft Agent Framework
"""

from agent_framework.orchestrator import Agent
from typing import Dict, Any
from tools.langchain_tools import langchain_tools_manager
import asyncio
import re
from datetime import datetime, timedelta

class TravelSpecialistAgent(Agent):
    """Agent specialized in creating travel plans and itineraries"""
    
    def __init__(self):
        super().__init__(
            agent_id="travel_specialist",
            name="Travel Specialist",
            capabilities=["Travel Planning", "Itinerary Creation", "Destination Research", "Trip Coordination"]
        )
    
    async def process_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process travel planning tasks"""
        try:
            request = task_data.get("request", "")
            team_domain = task_data.get("team_domain", "travel_planning")
            preferences = task_data.get("preferences", {})
            
            # Use LangChain tools for travel research
            search_tool = langchain_tools_manager.get_tool("duckduckgo_search")
            research_result = "No search results available"
            if search_tool:
                try:
                    research_result = search_tool.invoke(f"best travel destinations and tips for {request}")
                except Exception as e:
                    research_result = f"Search failed: {str(e)}"
            
            # Use LangChain tools for detailed travel planning
            tavily_tool = langchain_tools_manager.get_tool("tavily_search")
            detailed_info = "No detailed information available"
            if tavily_tool:
                try:
                    detailed_info = tavily_tool.invoke(f"detailed travel itinerary and activities for {request}")
                except Exception as e:
                    detailed_info = f"Detailed search failed: {str(e)}"
            
            # Create travel plan output with real data
            travel_output = {
                "destinations": f"Recommended destinations based on your request: {request}",
                "itinerary": f"Custom itinerary for {request} based on current travel trends",
                "travel_tips": f"Travel tips and recommendations for {request}",
                "research_insights": research_result,
                "detailed_info": detailed_info
            }
            
            return {
                "success": True,
                "agent": self.name,
                "result": travel_output,
                "status": "completed"
            }
        except Exception as e:
            return {
                "success": False,
                "agent": self.name,
                "error": str(e),
                "status": "failed"
            }

class ResearchAssistantAgent(Agent):
    """Agent specialized in gathering detailed travel information"""
    
    def __init__(self):
        super().__init__(
            agent_id="research_assistant",
            name="Research Assistant",
            capabilities=["Information Gathering", "Local Insights", "Cultural Information", "Practical Details"]
        )
        self.processing_task = False  # Track if agent is currently processing a task
        self.last_task_id = None  # Track the last processed task ID
    
    async def process_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process research tasks with proper termination to avoid infinite loops"""
        # Check if we're already processing this task to prevent infinite loops
        task_id = task_data.get("task_id", str(hash(str(task_data))))
        if self.processing_task and self.last_task_id == task_id:
            return {
                "success": True,
                "agent": self.name,
                "result": {
                    "accommodation_info": "Task already processed",
                    "transportation_info": "Task already processed",
                    "local_insights": "Task already processed",
                    "cultural_information": "Task already processed"
                },
                "status": "completed"
            }
        
        try:
            self.processing_task = True
            self.last_task_id = task_id
            
            request = task_data.get("request", "")
            plan = task_data.get("plan", {})
            
            print(f"ResearchAssistantAgent processing request: {request}")
            
            # Extract destination and potential dates from request
            destination = self._extract_destination(request)
            dates = self._extract_dates(request)
            
            print(f"Extracted destination: {destination}")
            print(f"Extracted dates: {dates}")
            
            # Initialize information variables
            accommodation_info = "No accommodation information available"
            transportation_info = "No transportation information available"
            local_insights = "No local insights available"
            cultural_information = "No cultural information available"
            
            # Use Google Hotels tool if available and we have dates
            hotels_tool = langchain_tools_manager.get_tool("google_hotels")
            if hotels_tool and destination and dates.get("check_in") and dates.get("check_out"):
                try:
                    hotel_params = {
                        "location": destination,
                        "check_in_date": dates["check_in"],
                        "check_out_date": dates["check_out"],
                        "adults": 2,
                        "children": 0,
                        "rooms": 1,
                        "currency": "USD",
                        "gl": "sa",  # Saudi Arabia for Madinah
                        "hl": "en",
                        "sort_by": 8,  # Sort by highest rating
                        "free_cancellation": True,
                        "free_wifi": True,
                        "free_parking": True,
                        "air_conditioning": True
                    }
                    print(f"Calling Google Hotels tool with params: {hotel_params}")
                    accommodation_info = hotels_tool.invoke(hotel_params)
                    print(f"Google Hotels result: {accommodation_info[:200]}...")  # Show first 200 chars
                except Exception as e:
                    accommodation_info = f"Hotel search failed: {str(e)}"
                    print(f"Hotel search error: {e}")
            
            # Use Google Flights tool if available and we have flight information
            flights_tool = langchain_tools_manager.get_tool("google_flights")
            if flights_tool and destination and dates.get("check_in"):
                try:
                    # For Madinah, we need to handle this specially since it's a religious destination
                    # We'll use a common departure point like Jeddah (JED) which is the main gateway
                    departure_id = "JED" if "madinah" in destination.lower() or "medina" in destination.lower() else "NYC"
                    
                    flight_params = {
                        "departure_id": departure_id,
                        "arrival_id": self._get_airport_code(destination),
                        "outbound_date": dates["check_in"],
                        "return_date": dates.get("check_out"),
                        "travel_class": 1,  # Economy
                        "adults": 2,
                        "children": 0,
                        "infants_in_seat": 0,
                        "infants_on_lap": 0,
                        "stops": None,  # Any number of stops
                        "currency": "USD",
                        "gl": "sa" if "madinah" in destination.lower() or "medina" in destination.lower() else "us",
                        "hl": "en"
                    }
                    print(f"Calling Google Flights tool with params: {flight_params}")
                    transportation_info = flights_tool.invoke(flight_params)
                    print(f"Google Flights result: {transportation_info[:200]}...")  # Show first 200 chars
                except Exception as e:
                    transportation_info = f"Flight search failed: {str(e)}"
                    print(f"Flight search error: {e}")
            
            # Use LangChain tools for general research
            search_tool = langchain_tools_manager.get_tool("duckduckgo_search")
            if search_tool:
                try:
                    # Search for accommodations in Madinah specifically
                    if "madinah" in request.lower() or "medina" in request.lower():
                        if not accommodation_info or "No accommodation" in accommodation_info:
                            print("Searching for Madinah accommodations with DuckDuckGo")
                            accommodation_info = search_tool.invoke(f"best hotels and accommodations in Madinah Saudi Arabia for family travel")
                        if not transportation_info or "No transportation" in transportation_info:
                            print("Searching for Madinah transportation with DuckDuckGo")
                            transportation_info = search_tool.invoke(f"transportation options in Madinah Saudi Arabia for tourists")
                        print("Searching for Madinah local insights with DuckDuckGo")
                        local_insights = search_tool.invoke(f"top attractions and things to do in Madinah Saudi Arabia")
                        print("Searching for Madinah cultural information with DuckDuckGo")
                        cultural_information = search_tool.invoke(f"cultural tips and customs for visiting Madinah Saudi Arabia")
                    else:
                        # Generic searches for other destinations
                        if not accommodation_info or "No accommodation" in accommodation_info:
                            print(f"Searching for accommodations with DuckDuckGo: best accommodations for {request}")
                            accommodation_info = search_tool.invoke(f"best accommodations for {request}")
                        if not transportation_info or "No transportation" in transportation_info:
                            print(f"Searching for transportation with DuckDuckGo: transportation options for {request}")
                            transportation_info = search_tool.invoke(f"transportation options for {request}")
                        print(f"Searching for local insights with DuckDuckGo: local insights and attractions for {request}")
                        local_insights = search_tool.invoke(f"local insights and attractions for {request}")
                        print(f"Searching for cultural information with DuckDuckGo: cultural information and customs for {request}")
                        cultural_information = search_tool.invoke(f"cultural information and customs for {request}")
                except Exception as e:
                    if "No accommodation" in accommodation_info:
                        accommodation_info = f"Accommodation search failed: {str(e)}"
                    if "No transportation" in transportation_info:
                        transportation_info = f"Transportation search failed: {str(e)}"
                    if "No local" in local_insights:
                        local_insights = f"Local insights search failed: {str(e)}"
                    if "No cultural" in cultural_information:
                        cultural_information = f"Cultural information search failed: {str(e)}"
            
            # Create research output with real data
            research_output = {
                "accommodation_info": accommodation_info,
                "transportation_info": transportation_info,
                "local_insights": local_insights,
                "cultural_information": cultural_information
            }
            
            print(f"Research output: {research_output}")
            
            # Reset processing flag on successful completion
            self.processing_task = False
            
            return {
                "success": True,
                "agent": self.name,
                "result": research_output,
                "status": "completed"
            }
        except Exception as e:
            # Reset processing flag on error
            self.processing_task = False
            print(f"ResearchAssistantAgent error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "agent": self.name,
                "error": str(e),
                "status": "failed"
            }
    
    def _extract_destination(self, request: str) -> str:
        """Extract destination from request"""
        # Simple extraction - in a real implementation, this would be more sophisticated
        destinations = ["madinah", "medina", "paris", "london", "tokyo", "new york", "dubai", "los angeles", "sydney", "singapore"]
        for dest in destinations:
            if dest in request.lower():
                return dest.title()
        return request  # Return the whole request if no known destination found
    
    def _get_airport_code(self, destination: str) -> str:
        """Get airport code for destination"""
        airport_codes = {
            "New York": "NYC",
            "Los Angeles": "LAX",
            "London": "LHR",
            "Paris": "CDG",
            "Tokyo": "HND",
            "Dubai": "DXB",
            "Sydney": "SYD",
            "Singapore": "SIN",
            "Madinah": "MED",
            "Medina": "MED",
            "Jeddah": "JED",
            "Riyadh": "RUH"
        }
        return airport_codes.get(destination, destination)
    
    def _extract_dates(self, request: str) -> Dict[str, str]:
        """Extract dates from request"""
        # Simple date extraction - in a real implementation, this would be more sophisticated
        # Look for date patterns like MM/DD/YYYY or MM-DD-YYYY
        import re
        from datetime import datetime, timedelta
        
        print(f"Extracting dates from request: {request}")
        
        date_pattern = r'(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})'
        dates = re.findall(date_pattern, request)
        
        if len(dates) >= 2:
            result = {
                "check_in": dates[0].replace('/', '-'),
                "check_out": dates[1].replace('/', '-')
            }
            print(f"Found 2+ dates: {result}")
            return result
        elif len(dates) == 1:
            # Assume 7-day stay
            try:
                date_obj = datetime.strptime(dates[0], '%m/%d/%Y')
            except ValueError:
                try:
                    date_obj = datetime.strptime(dates[0], '%m-%d-%Y')
                except ValueError:
                    # If we can't parse the date, use default
                    next_month = datetime.now() + timedelta(days=30)
                    result = {
                        "check_in": next_month.strftime('%Y-%m-%d'),
                        "check_out": (next_month + timedelta(days=7)).strftime('%Y-%m-%d')
                    }
                    print(f"Could not parse single date, using default: {result}")
                    return result
            result = {
                "check_in": dates[0].replace('/', '-'),
                "check_out": (date_obj + timedelta(days=7)).strftime('%Y-%m-%d')
            }
            print(f"Found 1 date, extending to 7 days: {result}")
            return result
        
        # Check for duration mentions like "14 days"
        duration_pattern = r'(\d+)\s*(?:day|days)'
        duration_matches = re.findall(duration_pattern, request, re.IGNORECASE)
        
        if duration_matches:
            try:
                days = int(duration_matches[0])
                # Start from today
                start_date = datetime.now() + timedelta(days=7)  # Start in a week
                end_date = start_date + timedelta(days=days)
                result = {
                    "check_in": start_date.strftime('%Y-%m-%d'),
                    "check_out": end_date.strftime('%Y-%m-%d')
                }
                print(f"Found duration pattern '{duration_matches[0]} days', calculated dates: {result}")
                return result
            except (ValueError, IndexError):
                pass
        
        # Default to next month if no dates found
        next_month = datetime.now() + timedelta(days=30)
        result = {
            "check_in": next_month.strftime('%Y-%m-%d'),
            "check_out": (next_month + timedelta(days=14)).strftime('%Y-%m-%d')  # 14 days as requested
        }
        print(f"No dates found, using default 14-day period: {result}")
        return result

class TavilySearchAgent(Agent):
    """Agent specialized in real-time search using Tavily"""
    
    def __init__(self):
        super().__init__(
            agent_id="tavily_search",
            name="Tavily Search Agent",
            capabilities=["Real-time Search", "Current Information", "News", "Events"]
        )
        self.search_count = 0  # Track search calls to prevent excessive usage
        self.processing_task = False  # Track if agent is currently processing a task
        self.last_task_id = None  # Track the last processed task ID
    
    async def process_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process search tasks using real Tavily API with proper termination"""
        # Check if we're already processing this task to prevent infinite loops
        task_id = task_data.get("task_id", str(hash(str(task_data))))
        if self.processing_task and self.last_task_id == task_id:
            return {
                "success": True,
                "agent": self.name,
                "result": {
                    "current_info": "Search already performed for this request",
                    "search_query": "",
                    "search_results": []
                },
                "status": "completed"
            }
        
        try:
            self.processing_task = True
            self.last_task_id = task_id
            
            request = task_data.get("request", "")
            
            # Limit search calls to prevent excessive usage
            if self.search_count >= 1:
                self.processing_task = False
                return {
                    "success": True,
                    "agent": self.name,
                    "result": {
                        "current_info": "Search limit reached to prevent excessive API usage",
                        "search_query": f"current travel information about {request}",
                        "search_results": []
                    },
                    "status": "completed"
                }
            
            # Use Tavily search tool for real-time search
            search_tool = langchain_tools_manager.get_tool("tavily_search")
            search_result = "No search results available"
            if search_tool:
                try:
                    # Perform actual search with Tavily API
                    search_query = f"current travel information about {request}"
                    # Use invoke directly (synchronous call in async context)
                    search_result = search_tool.invoke(search_query)
                    self.search_count += 1  # Increment search count
                except Exception as e:
                    search_result = f"Search failed: {str(e)}"
            
            # Process and format the search results
            if isinstance(search_result, list):
                # Extract key information from search results
                processed_results = []
                for item in search_result[:3]:  # Take top 3 results
                    if isinstance(item, dict):
                        processed_results.append({
                            "title": item.get("title", "No title"),
                            "url": item.get("url", "No URL"),
                            "content": item.get("content", "No content")[:200] + "..." if len(item.get("content", "")) > 200 else item.get("content", "No content")
                        })
                current_info = processed_results
            else:
                current_info = str(search_result)
            
            # Create search output with real data
            search_output = {
                "current_info": current_info,
                "search_query": f"current travel information about {request}",
                "search_results": search_result
            }
            
            # Reset processing flag on successful completion
            self.processing_task = False
            
            return {
                "success": True,
                "agent": self.name,
                "result": search_output,
                "status": "completed"
            }
        except Exception as e:
            # Reset processing flag on error
            self.processing_task = False
            return {
                "success": False,
                "agent": self.name,
                "error": str(e),
                "status": "failed"
            }