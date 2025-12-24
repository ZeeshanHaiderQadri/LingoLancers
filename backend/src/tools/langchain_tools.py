"""
LangChain Tools Integration for the Lingo Master Agent Backend
"""

from typing import Dict, Any, List, Optional
from langchain_core.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_community.tools.tavily_search import TavilySearchResults
import os

class LangChainToolsManager:
    """Manager for LangChain tools integration"""
    
    def __init__(self):
        self.tools = {}
        self.initialized = False
    
    def initialize(self) -> bool:
        """Initialize all LangChain tools"""
        try:
            # Initialize search tools
            self.tools["duckduckgo_search"] = DuckDuckGoSearchRun()
            
            # Initialize Tavily search if API key is available
            tavily_api_key = os.getenv("TAVILY_API_KEY")
            if tavily_api_key:
                self.tools["tavily_search"] = TavilySearchResults(
                    tavily_api_key=tavily_api_key,
                    max_results=5
                )
            
            # Initialize SERP API tools if API key is available
            serp_api_key = os.getenv("SERP_API_KEY")
            if serp_api_key:
                self.tools["google_flights"] = self.create_google_flights_tool()
                self.tools["google_hotels"] = self.create_google_hotels_tool()
            
            # Add custom tools
            self.tools["custom_file_reader"] = self.create_file_reader_tool()
            self.tools["custom_web_scraper"] = self.create_web_scraper_tool()
            
            self.initialized = True
            print("✅ LangChain tools initialized successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error initializing LangChain tools: {e}")
            return False
    
    def create_google_flights_tool(self):
        """Create a Google Flights search tool using SERP API"""
        @tool
        def google_flights_tool(
            departure_id: str, 
            arrival_id: str, 
            outbound_date: str, 
            return_date: Optional[str] = None,
            travel_class: int = 1,  # 1=Economy, 2=Premium Economy, 3=Business, 4=First
            adults: int = 1,
            children: int = 0,
            infants_in_seat: int = 0,
            infants_on_lap: int = 0,
            stops: Optional[int] = None,  # 0=Any, 1=Nonstop only, 2=1 stop or fewer, 3=2 stops or fewer
            currency: str = "USD",
            gl: str = "us",
            hl: str = "en"
        ) -> str:
            """
            Search for flights using Google Flights via SERP API.
            Args:
                departure_id: Departure airport code or location kgmid (e.g., "CDG" or "/m/04jpl")
                arrival_id: Arrival airport code or location kgmid (e.g., "LAX" or "/m/0vzm")
                outbound_date: Departure date in YYYY-MM-DD format
                return_date: Return date in YYYY-MM-DD format (required for round trip)
                travel_class: 1=Economy, 2=Premium Economy, 3=Business, 4=First
                adults: Number of adults (default: 1)
                children: Number of children (default: 0)
                infants_in_seat: Number of infants in seat (default: 0)
                infants_on_lap: Number of infants on lap (default: 0)
                stops: 0=Any, 1=Nonstop only, 2=1 stop or fewer, 3=2 stops or fewer
                currency: Currency code (default: "USD")
                gl: Country code (default: "us")
                hl: Language code (default: "en")
            """
            try:
                # Import here to avoid issues when serpapi is not installed
                from serpapi import search
                
                # Prepare search parameters according to SERP API documentation
                params = {
                    "engine": "google_flights",
                    "departure_id": departure_id,
                    "arrival_id": arrival_id,
                    "outbound_date": outbound_date,
                    "travel_class": travel_class,
                    "adults": adults,
                    "children": children,
                    "infants_in_seat": infants_in_seat,
                    "infants_on_lap": infants_on_lap,
                    "currency": currency,
                    "gl": gl,
                    "hl": hl,
                    "api_key": os.getenv("SERP_API_KEY")
                }
                
                # Add return date if provided (type 1 = Round trip, type 2 = One way)
                if return_date:
                    params["return_date"] = return_date
                    params["type"] = 1  # Round trip
                else:
                    params["type"] = 2  # One way
                
                # Add stops filter if specified
                if stops is not None:
                    params["stops"] = stops
                
                # Execute search
                results = search(params)
                
                # Process and format results according to SERP API documentation
                flights_data = []
                # Check for best_flights first, then other_flights
                flight_options = results.get("best_flights", []) or results.get("other_flights", [])
                
                if flight_options:
                    for i, flight_option in enumerate(flight_options[:3]):  # Top 3 options
                        if "flights" in flight_option:
                            flights_info = []
                            total_price = flight_option.get("price", "N/A")
                            total_duration = flight_option.get("total_duration", 0)
                            
                            # Process each flight segment
                            for flight in flight_option["flights"]:
                                departure_airport = flight.get("departure_airport", {})
                                arrival_airport = flight.get("arrival_airport", {})
                                
                                flight_info = {
                                    "airline": flight.get("airline", "N/A"),
                                    "flight_number": flight.get("flight_number", "N/A"),
                                    "departure": {
                                        "airport": departure_airport.get("name", "N/A"),
                                        "id": departure_airport.get("id", "N/A"),
                                        "time": departure_airport.get("time", "N/A")
                                    },
                                    "arrival": {
                                        "airport": arrival_airport.get("name", "N/A"),
                                        "id": arrival_airport.get("id", "N/A"),
                                        "time": arrival_airport.get("time", "N/A")
                                    },
                                    "duration": flight.get("duration", 0),
                                    "airplane": flight.get("airplane", "N/A"),
                                    "travel_class": flight.get("travel_class", "N/A")
                                }
                                flights_info.append(flight_info)
                            
                            # Process layovers if any
                            layovers = []
                            if "layovers" in flight_option:
                                for layover in flight_option["layovers"]:
                                    layovers.append({
                                        "airport": layover.get("name", "N/A"),
                                        "id": layover.get("id", "N/A"),
                                        "duration": layover.get("duration", 0),
                                        "overnight": layover.get("overnight", False)
                                    })
                            
                            flights_data.append({
                                "option": i + 1,
                                "price": total_price,
                                "total_duration": total_duration,
                                "flights": flights_info,
                                "layovers": layovers
                            })
                    
                    # Format the output as a readable string
                    if flights_data:
                        output_lines = []
                        for flight_data in flights_data:
                            output_lines.append(f"Option {flight_data['option']}:")
                            output_lines.append(f"  Price: {flight_data['price']} {currency}")
                            output_lines.append(f"  Total Duration: {flight_data['total_duration']} minutes")
                            
                            for j, flight in enumerate(flight_data['flights']):
                                output_lines.append(f"  Flight {j+1}: {flight['airline']} {flight['flight_number']}")
                                output_lines.append(f"    From: {flight['departure']['airport']} ({flight['departure']['id']}) at {flight['departure']['time']}")
                                output_lines.append(f"    To: {flight['arrival']['airport']} ({flight['arrival']['id']}) at {flight['arrival']['time']}")
                                output_lines.append(f"    Duration: {flight['duration']} minutes")
                                output_lines.append(f"    Aircraft: {flight['airplane']}")
                                output_lines.append(f"    Class: {flight['travel_class']}")
                            
                            if flight_data['layovers']:
                                output_lines.append("  Layovers:")
                                for layover in flight_data['layovers']:
                                    overnight_text = " (overnight)" if layover.get('overnight') else ""
                                    output_lines.append(f"    {layover['airport']} ({layover['id']}): {layover['duration']} minutes{overnight_text}")
                            
                            output_lines.append("")  # Empty line between options
                        
                        return "\\n".join(output_lines).strip()
                    else:
                        return "No detailed flight information available"
                else:
                    return "No flight results found"
                    
            except Exception as e:
                return f"Error searching flights: {str(e)}"
        
        return google_flights_tool
    
    def create_google_hotels_tool(self):
        """Create a Google Hotels search tool using SERP API"""
        @tool
        def google_hotels_tool(
            location: str, 
            check_in_date: str, 
            check_out_date: str, 
            guests: int = 2,
            currency: str = "USD",
            gl: str = "us",
            hl: str = "en",
            sort_by: Optional[int] = None,  # 3=Lowest price, 8=Highest rating, 13=Most reviewed
            adults: int = 2,
            children: int = 0,
            infants: int = 0,
            rooms: int = 1,
            property_type: Optional[str] = None,  # hotel, hostel, aparthotel, inn, motel, b&b, resort, vacation_rental, vacation_home, villa, campground
            min_price: Optional[int] = None,
            max_price: Optional[int] = None,
            rating: Optional[int] = None,  # 7=3.5+, 8=4.0+, 9=4.5+
            free_cancellation: Optional[bool] = None,
            amenities: Optional[str] = None,  # Comma-separated list of amenity IDs
            brands: Optional[str] = None,  # Comma-separated list of brand IDs
            hotel_class: Optional[str] = None,  # Comma-separated list of hotel classes (2=2-star, 3=3-star, 4=4-star, 5=5-star)
            special_offers: Optional[bool] = None,
            eco_certified: Optional[bool] = None,
            vacation_rentals: Optional[bool] = None,
            bedrooms: Optional[int] = None,
            bathrooms: Optional[int] = None
        ) -> str:
            """
            Search for hotels using Google Hotels via SERP API.
            Args:
                location: City or hotel name (e.g., "New York" or "Hilton Hotel")
                check_in_date: Check-in date in YYYY-MM-DD format
                check_out_date: Check-out date in YYYY-MM-DD format
                guests: Number of guests (default: 2)
                currency: Currency code (default: "USD")
                gl: Country code (default: "us")
                hl: Language code (default: "en")
                sort_by: 3=Lowest price, 8=Highest rating, 13=Most reviewed
                adults: Number of adults (default: 2)
                children: Number of children (default: 0)
                infants: Number of infants (default: 0)
                rooms: Number of rooms (default: 1)
                property_type: Property type ID
                min_price: Minimum price per night
                max_price: Maximum price per night
                rating: 7=3.5+, 8=4.0+, 9=4.5+
                free_cancellation: Filter for free cancellation
                amenities: Comma-separated list of amenity IDs
                brands: Comma-separated list of brand IDs
                hotel_class: Comma-separated list of hotel classes (2=2-star, 3=3-star, 4=4-star, 5=5-star)
                special_offers: Filter for special offers
                eco_certified: Filter for eco certified properties
                vacation_rentals: Search for vacation rentals instead of hotels
                bedrooms: Minimum number of bedrooms (for vacation rentals)
                bathrooms: Minimum number of bathrooms (for vacation rentals)
            """
            try:
                # Import here to avoid issues when serpapi is not installed
                from serpapi import search
                
                # Prepare search parameters according to SERP API documentation
                params = {
                    "engine": "google_hotels",
                    "q": location,
                    "check_in_date": check_in_date,
                    "check_out_date": check_out_date,
                    "adults": adults,
                    "children": children,
                    "infants": infants,
                    "rooms": rooms,
                    "currency": currency,
                    "gl": gl,
                    "hl": hl,
                    "api_key": os.getenv("SERP_API_KEY")
                }
                
                # Add optional parameters if specified
                if sort_by is not None:
                    params["sort_by"] = sort_by
                
                if property_type is not None:
                    params["property_type"] = property_type
                
                if min_price is not None:
                    params["min_price"] = min_price
                
                if max_price is not None:
                    params["max_price"] = max_price
                
                if rating is not None:
                    params["rating"] = rating
                
                if amenities is not None:
                    params["amenities"] = amenities
                
                if brands is not None:
                    params["brands"] = brands
                
                if hotel_class is not None:
                    params["hotel_class"] = hotel_class
                
                if free_cancellation is not None:
                    params["free_cancellation"] = str(free_cancellation).lower()
                
                if special_offers is not None:
                    params["special_offers"] = str(special_offers).lower()
                
                if eco_certified is not None:
                    params["eco_certified"] = str(eco_certified).lower()
                
                if vacation_rentals is not None:
                    params["vacation_rentals"] = str(vacation_rentals).lower()
                
                if bedrooms is not None:
                    params["bedrooms"] = bedrooms
                
                if bathrooms is not None:
                    params["bathrooms"] = bathrooms
                
                # Execute search
                results = search(params)
                
                # Process and format results
                if "properties" in results:
                    hotels_summary = []
                    for i, property in enumerate(results["properties"][:5]):  # Top 5 options
                        name = property.get("name", "N/A")
                        price_info = property.get("rate_per_night", {})
                        price = price_info.get("lowest", "N/A")
                        currency_code = price_info.get("currency", currency)
                        rating = property.get("rating", "N/A")
                        reviews = property.get("reviews", "N/A")
                        location_info = property.get("location", {}).get("name", "N/A")
                        amenities = property.get("amenities", [])
                        images = property.get("images", [])
                        description = property.get("description", "No description available")
                        
                        # Format amenities as a comma-separated string
                        amenities_str = ", ".join(amenities[:5]) if amenities else "No amenities listed"
                        
                        # Get first image if available
                        image_url = images[0] if images else "No image available"
                        
                        # Extract key information from description
                        description_preview = description[:200] + "..." if len(description) > 200 else description
                        
                        hotels_summary.append(
                            f"Option {i+1}: {name}\\n"
                            f"  Price: {price} {currency_code} per night\\n"
                            f"  Rating: {rating}/5 ({reviews} reviews)\\n"
                            f"  Location: {location_info}\\n"
                            f"  Amenities: {amenities_str}\\n"
                            f"  Description: {description_preview}"
                        )
                    
                    return "\\n\\n".join(hotels_summary) if hotels_summary else "No hotels found"
                else:
                    return "No hotel results available"
                    
            except Exception as e:
                return f"Error searching hotels: {str(e)}"
        
        return google_hotels_tool
    
    def create_file_reader_tool(self):
        """Create a custom file reader tool"""
        @tool
        def file_reader_tool(file_path: str) -> str:
            """Read and return the contents of a file"""
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    return file.read()
            except Exception as e:
                return f"Error reading file: {str(e)}"
        
        return file_reader_tool
    
    def create_web_scraper_tool(self):
        """Create a custom web scraper tool"""
        @tool
        def web_scraper_tool(url: str) -> str:
            """Scrape and return the text content of a webpage"""
            try:
                import requests
                from bs4 import BeautifulSoup
                
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                
                # Get text content
                text = soup.get_text()
                
                # Clean up whitespace
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                text = ' '.join(chunk for chunk in chunks if chunk)
                
                return text[:2000]  # Limit to 2000 characters
            except Exception as e:
                return f"Error scraping webpage: {str(e)}"
        
        return web_scraper_tool
    
    def get_tool(self, tool_name: str):
        """Get a specific tool by name"""
        if not self.initialized:
            raise RuntimeError("LangChainToolsManager not initialized")
        
        return self.tools.get(tool_name)
    
    def get_all_tools(self) -> Dict[str, Any]:
        """Get all available tools"""
        if not self.initialized:
            raise RuntimeError("LangChainToolsManager not initialized")
        
        return self.tools
    
    def search_tools(self, query: str) -> List[Dict[str, Any]]:
        """Search for tools based on a query"""
        if not self.initialized:
            raise RuntimeError("LangChainToolsManager not initialized")
        
        results = []
        
        # Search in tool names and descriptions
        for tool_name, tool_obj in self.tools.items():
            if query.lower() in tool_name.lower() or query.lower() in str(tool_obj.__doc__).lower():
                results.append({
                    "name": tool_name,
                    "description": tool_obj.__doc__ or "No description available",
                    "type": "langchain_tool"
                })
        
        return results

# Global instance
langchain_tools_manager = LangChainToolsManager()

# Example usage functions
def search_with_duckduckgo(query: str) -> str:
    """Search using DuckDuckGo"""
    try:
        search_tool = langchain_tools_manager.get_tool("duckduckgo_search")
        if search_tool:
            return search_tool.invoke(query)
        else:
            return "DuckDuckGo search tool not available"
    except Exception as e:
        return f"Error searching with DuckDuckGo: {str(e)}"

def search_with_tavily(query: str) -> str:
    """Search using Tavily"""
    try:
        search_tool = langchain_tools_manager.get_tool("tavily_search")
        if search_tool:
            return search_tool.invoke(query)
        else:
            return "Tavily search tool not available"
    except Exception as e:
        return f"Error searching with Tavily: {str(e)}"

def search_flights(origin: str, destination: str, departure_date: str, return_date: Optional[str] = None) -> str:
    """Search for flights using Google Flights via SERP API"""
    try:
        flights_tool = langchain_tools_manager.get_tool("google_flights")
        if flights_tool:
            # Create a dictionary to pass to the tool
            tool_input = {
                "origin": origin,
                "destination": destination,
                "departure_date": departure_date
            }
            if return_date:
                tool_input["return_date"] = return_date
            return flights_tool.invoke(tool_input)
        else:
            return "Google Flights tool not available"
    except Exception as e:
        return f"Error searching flights: {str(e)}"

def search_hotels(location: str, check_in_date: str, check_out_date: str, guests: int = 2) -> str:
    """Search for hotels using Google Hotels via SERP API"""
    try:
        hotels_tool = langchain_tools_manager.get_tool("google_hotels")
        if hotels_tool:
            # Create a dictionary to pass to the tool
            tool_input = {
                "location": location,
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "guests": guests
            }
            return hotels_tool.invoke(tool_input)
        else:
            return "Google Hotels tool not available"
    except Exception as e:
        return f"Error searching hotels: {str(e)}"

def read_file(file_path: str) -> str:
    """Read a file using the file reader tool"""
    try:
        file_tool = langchain_tools_manager.get_tool("custom_file_reader")
        if file_tool:
            return file_tool.invoke(file_path)
        else:
            return "File reader tool not available"
    except Exception as e:
        return f"Error reading file: {str(e)}"

def scrape_webpage(url: str) -> str:
    """Scrape a webpage using the web scraper tool"""
    try:
        scraper_tool = langchain_tools_manager.get_tool("custom_web_scraper")
        if scraper_tool:
            return scraper_tool.invoke(url)
        else:
            return "Web scraper tool not available"
    except Exception as e:
        return f"Error scraping webpage: {str(e)}"

# Initialize the tools manager when the module is imported
# This would be called during application startup
langchain_tools_manager.initialize()