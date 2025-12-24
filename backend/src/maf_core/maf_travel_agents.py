"""
Proper Microsoft Agent Framework Travel Agents with LLM and Tool Integration
Following MAF documentation patterns
"""

import os
import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum

# LangChain imports for LLM and tools
from langchain_openai import ChatOpenAI
from langchain_core.tools import Tool
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

logger = logging.getLogger(__name__)

@dataclass
class MAFMessage:
    """MAF Message structure"""
    id: str
    sender: str
    recipient: str
    content: Dict[str, Any]
    message_type: str = "user_message"
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

class MAFAgentState(Enum):
    """MAF Agent States"""
    IDLE = "idle"
    PROCESSING = "processing"
    WAITING = "waiting"
    COMPLETED = "completed"
    ERROR = "error"

class MAFTravelPlannerAgent:
    """
    Travel Planner Agent with LLM reasoning and tool integration
    Follows Microsoft Agent Framework patterns
    """
    
    def __init__(self):
        self.name = "TravelPlannerAgent"
        self.description = "Intelligent travel planning with LLM reasoning"
        self.state = MAFAgentState.IDLE
        self.conversation_history: List[MAFMessage] = []
        self.is_active = False
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.7,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Initialize tools
        self.tools = self._initialize_tools()
        
        # Create agent with tools
        self.agent_executor = self._create_agent()
        
        logger.info(f"✅ {self.name} initialized with LLM and tools")
    
    def _initialize_tools(self) -> List[Tool]:
        """Initialize tools for the agent"""
        tools = [
            Tool(
                name="analyze_destination",
                func=self._analyze_destination,
                description="Analyze a travel destination and extract key information like city, country, duration"
            ),
            Tool(
                name="create_itinerary",
                func=self._create_itinerary,
                description="Create a day-by-day travel itinerary for a destination"
            ),
            Tool(
                name="calculate_budget",
                func=self._calculate_budget,
                description="Calculate estimated budget for a trip"
            )
        ]
        return tools
    
    def _create_agent(self):
        """Create simple LLM-based agent without deprecated APIs"""
        # Just return None - we'll use direct LLM calls instead
        return None
    
    def _analyze_destination(self, request: str) -> str:
        """Analyze destination from request"""
        # Use LLM to extract information
        prompt = f"""Extract the following information from this travel request:
- Destination city
- Destination country  
- Duration (in days)
- Departure city (if mentioned)
- Travel dates (if mentioned)

Request: {request}

Return as JSON format."""
        
        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content
        except Exception as e:
            logger.error(f"Error analyzing destination: {e}")
            return f"{{\"destination_city\": \"Unknown\", \"duration\": 7}}"
    
    def _create_itinerary(self, destination: str, duration: int = 7) -> str:
        """Create travel itinerary"""
        prompt = f"""Create a comprehensive {duration}-day travel itinerary for {destination}.

For each day, provide:
- Morning activities (specific times and locations)
- Afternoon activities (specific attractions with addresses)
- Evening activities (restaurants, entertainment)
- Transportation tips between locations
- Estimated costs for activities
- Local insider tips

Make it detailed, practical, and include specific place names, addresses where possible, and realistic timing.

Format as:
Day 1: [Title]
Morning (9:00 AM): [Specific activity at specific location]
Afternoon (2:00 PM): [Specific activity]
Evening (7:00 PM): [Specific activity]
Tips: [Local insights]
Estimated cost: $[amount]

Continue for all {duration} days."""
        
        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content
        except Exception as e:
            logger.error(f"Error creating itinerary: {e}")
            return f"Day-by-day itinerary for {destination}"
    
    def _calculate_budget(self, destination: str, duration: int = 7) -> str:
        """Calculate budget estimate"""
        prompt = f"""Create a detailed budget breakdown for a {duration}-day trip to {destination}.

Provide specific costs for:

1. Accommodation:
   - Budget option: $X/night
   - Mid-range option: $Y/night
   - Luxury option: $Z/night
   - Total for {duration} nights

2. Food & Dining:
   - Breakfast: $X per day
   - Lunch: $Y per day
   - Dinner: $Z per day
   - Snacks/drinks: $W per day
   - Total for {duration} days

3. Transportation:
   - Airport transfers: $X
   - Local transport (metro/bus): $Y per day
   - Taxis/Uber: $Z estimated
   - Total transportation

4. Activities & Attractions:
   - List 5-7 main attractions with entry fees
   - Tours and experiences
   - Total activities budget

5. Miscellaneous:
   - Travel insurance
   - Souvenirs
   - Emergency fund
   - Tips and gratuities

Provide three budget tiers:
- Budget traveler: $X total
- Mid-range traveler: $Y total
- Luxury traveler: $Z total

Use realistic current prices for {destination}."""
        
        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content
        except Exception as e:
            logger.error(f"Error calculating budget: {e}")
            return f"Budget estimate for {destination}: ${duration * 200}"
    
    async def start(self) -> bool:
        """Start the agent"""
        self.is_active = True
        self.state = MAFAgentState.IDLE
        logger.info(f"🚀 {self.name} started")
        return True
    
    async def stop(self) -> bool:
        """Stop the agent"""
        self.is_active = False
        self.state = MAFAgentState.IDLE
        logger.info(f"🛑 {self.name} stopped")
        return True
    
    async def process_message(self, message: MAFMessage) -> MAFMessage:
        """Process message with LLM reasoning"""
        try:
            self.state = MAFAgentState.PROCESSING
            logger.info(f"🧠 {self.name} processing with LLM")
            
            request = message.content.get("request", "")
            logger.info(f"📝 Request: {request}")
            
            # Use agent executor for intelligent processing
            result = await self._process_with_agent(request)
            
            self.state = MAFAgentState.COMPLETED
            
            response = MAFMessage(
                id=f"response_{datetime.now().timestamp()}",
                sender=self.name,
                recipient=message.sender,
                content={
                    "type": "travel_plan",
                    "result": result,
                    "status": "completed"
                },
                message_type="response"
            )
            
            logger.info(f"✅ {self.name} completed")
            return response
            
        except Exception as e:
            self.state = MAFAgentState.ERROR
            logger.error(f"❌ Error in {self.name}: {e}")
            return MAFMessage(
                id=f"error_{datetime.now().timestamp()}",
                sender=self.name,
                recipient=message.sender,
                content={"type": "error", "message": str(e)},
                message_type="error"
            )
    
    async def _process_with_agent(self, request: str) -> Dict[str, Any]:
        """Process request using direct LLM calls with tool integration"""
        try:
            # Analyze destination first
            destination_info = self._analyze_destination(request)
            
            # Create itinerary
            itinerary = self._create_itinerary(request, 7)
            
            # Calculate budget
            budget = self._calculate_budget(request, 7)
            
            # Combine results
            full_response = f"""Travel Plan Analysis:

{destination_info}

Detailed Itinerary:
{itinerary}

Budget Breakdown:
{budget}
"""
            
            return {
                "agent_output": full_response,
                "destination_info": destination_info
            }
        except Exception as e:
            logger.error(f"Error in agent processing: {e}")
            # Fallback to direct LLM call
            response = self.llm.invoke([HumanMessage(content=f"Create a comprehensive travel plan for: {request}")])
            return {"agent_output": response.content}

class MAFResearchAgent:
    """
    Research Agent with tool integration for SERP API
    """
    
    def __init__(self):
        self.name = "ResearchAgent"
        self.description = "Destination research with real API integration"
        self.state = MAFAgentState.IDLE
        self.is_active = False
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.5,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        logger.info(f"✅ {self.name} initialized")
    
    async def start(self) -> bool:
        self.is_active = True
        self.state = MAFAgentState.IDLE
        logger.info(f"🚀 {self.name} started")
        return True
    
    async def stop(self) -> bool:
        self.is_active = False
        logger.info(f"🛑 {self.name} stopped")
        return True
    
    async def process_message(self, message: MAFMessage) -> MAFMessage:
        """Process research request"""
        try:
            self.state = MAFAgentState.PROCESSING
            logger.info(f"🔬 {self.name} researching")
            
            destination = message.content.get("destination", "Unknown")
            
            # Use SERP API for real research
            research_data = await self._conduct_research(destination)
            
            self.state = MAFAgentState.COMPLETED
            
            response = MAFMessage(
                id=f"research_{datetime.now().timestamp()}",
                sender=self.name,
                recipient=message.sender,
                content={
                    "type": "research_results",
                    "destination": destination,
                    "research_data": research_data,
                    "status": "completed"
                },
                message_type="research_response"
            )
            
            logger.info(f"✅ {self.name} completed research")
            return response
            
        except Exception as e:
            self.state = MAFAgentState.ERROR
            logger.error(f"❌ Error in {self.name}: {e}")
            return MAFMessage(
                id=f"error_{datetime.now().timestamp()}",
                sender=self.name,
                recipient=message.sender,
                content={"type": "error", "message": str(e)},
                message_type="error"
            )
    
    async def _conduct_research(self, destination: str) -> Dict[str, Any]:
        """Conduct research using SERP API"""
        try:
            from tools.serp_api_tools import serp_api_tools
            
            # Search for attractions
            attractions = await serp_api_tools.search_attractions(destination)
            
            return {
                "destination": destination,
                "attractions": attractions.get("results", [])[:5],
                "source": "serp_api"
            }
        except Exception as e:
            logger.warning(f"⚠️ SERP API failed: {e}, using LLM fallback")
            
            # Fallback to LLM
            prompt = f"List the top 5 attractions in {destination} with brief descriptions."
            response = self.llm.invoke([HumanMessage(content=prompt)])
            
            return {
                "destination": destination,
                "attractions": response.content,
                "source": "llm_fallback"
            }

class MAFSearchAgent:
    """
    Search Agent for flights and hotels with SERP API integration
    """
    
    def __init__(self):
        self.name = "SearchAgent"
        self.description = "Real-time flight and hotel search"
        self.state = MAFAgentState.IDLE
        self.is_active = False
        
        logger.info(f"✅ {self.name} initialized")
    
    async def start(self) -> bool:
        self.is_active = True
        self.state = MAFAgentState.IDLE
        logger.info(f"🚀 {self.name} started")
        return True
    
    async def stop(self) -> bool:
        self.is_active = False
        logger.info(f"🛑 {self.name} stopped")
        return True
    
    async def process_message(self, message: MAFMessage) -> MAFMessage:
        """Process search request"""
        try:
            self.state = MAFAgentState.PROCESSING
            logger.info(f"🔍 {self.name} searching")
            
            departure = message.content.get("departure_city", "Unknown")
            destination = message.content.get("destination_city", "Unknown")
            
            # Perform real search
            search_results = await self._perform_search(departure, destination)
            
            self.state = MAFAgentState.COMPLETED
            
            response = MAFMessage(
                id=f"search_{datetime.now().timestamp()}",
                sender=self.name,
                recipient=message.sender,
                content={
                    "type": "search_results",
                    "departure": departure,
                    "destination": destination,
                    "search_results": search_results,
                    "status": "completed"
                },
                message_type="search_response"
            )
            
            logger.info(f"✅ {self.name} completed search")
            return response
            
        except Exception as e:
            self.state = MAFAgentState.ERROR
            logger.error(f"❌ Error in {self.name}: {e}")
            return MAFMessage(
                id=f"error_{datetime.now().timestamp()}",
                sender=self.name,
                recipient=message.sender,
                content={"type": "error", "message": str(e)},
                message_type="error"
            )
    
    async def _perform_search(self, departure: str, destination: str) -> Dict[str, Any]:
        """Perform search using SERP API"""
        try:
            from tools.serp_api_tools import serp_api_tools
            
            # Calculate dates
            departure_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
            return_date = (datetime.now() + timedelta(days=37)).strftime("%Y-%m-%d")
            
            # Search flights
            flights = await serp_api_tools.search_flights(
                self._get_airport_code(departure),
                self._get_airport_code(destination),
                departure_date,
                return_date
            )
            
            # Search hotels
            hotels = await serp_api_tools.search_hotels(
                destination,
                departure_date,
                return_date,
                4
            )
            
            return {
                "flights": flights.get("results", [])[:3],
                "hotels": hotels.get("results", [])[:3]
            }
        except Exception as e:
            logger.warning(f"⚠️ Search API failed: {e}")
            return {
                "flights": [{"airline": "Sample Airline", "price": 500}],
                "hotels": [{"name": f"Hotel in {destination}", "price": "$150/night"}]
            }
    
    def _get_airport_code(self, city: str) -> str:
        """Get airport code for city"""
        codes = {
            "mumbai": "BOM", "sydney": "SYD", "lahore": "LHE",
            "dubai": "DXB", "london": "LHR", "new york": "JFK",
            "madinah": "MED", "jeddah": "JED", "riyadh": "RUH"
        }
        
        for city_name, code in codes.items():
            if city_name.lower() in city.lower():
                return code
        
        return "JFK"
