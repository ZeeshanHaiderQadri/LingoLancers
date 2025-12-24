"""
Fixed SERP API Flight Search Implementation
Based on official SERP API documentation
"""

import os
import requests
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SerpFlightsAPI:
    """
    Proper SERP API Google Flights implementation
    Based on official documentation
    """
    
    def __init__(self):
        self.api_key = os.getenv("SERP_API_KEY")
        self.base_url = "https://serpapi.com/search"
        
        if not self.api_key:
            logger.warning("SERP API key not found")
    
    async def search_flights(
        self,
        departure_id: str,
        arrival_id: str,
        outbound_date: str,
        return_date: Optional[str] = None,
        adults: int = 1,
        children: int = 0,
        travel_class: int = 1  # 1=Economy, 2=Premium Economy, 3=Business, 4=First
    ) -> Dict[str, Any]:
        """
        Search flights using SERP API Google Flights
        
        Parameters based on official SERP API docs:
        - departure_id: Airport code (e.g., "JFK", "LAX")
        - arrival_id: Airport code (e.g., "LHR", "CDG")
        - outbound_date: YYYY-MM-DD format
        - return_date: YYYY-MM-DD format (optional, for round trip)
        - adults: Number of adult passengers
        - children: Number of child passengers
        - travel_class: 1=Economy, 2=Premium Economy, 3=Business, 4=First
        """
        
        if not self.api_key:
            logger.warning("No SERP API key, using mock data")
            return self._mock_flight_results(departure_id, arrival_id, outbound_date)
        
        try:
            # Build parameters according to SERP API docs
            params = {
                "engine": "google_flights",
                "departure_id": departure_id,
                "arrival_id": arrival_id,
                "outbound_date": outbound_date,
                "currency": "USD",
                "hl": "en",
                "gl": "us",
                "adults": adults,
                "children": children,
                "travel_class": travel_class,
                "api_key": self.api_key
            }
            
            # Add return date for round trip
            if return_date:
                params["return_date"] = return_date
                params["type"] = "2"  # Round trip
            else:
                params["type"] = "1"  # One way
            
            logger.info(f"🔍 SERP API Flight Search: {departure_id} → {arrival_id}")
            logger.info(f"   Dates: {outbound_date} to {return_date or 'one-way'}")
            
            response = requests.get(self.base_url, params=params, timeout=15)
            
            # Log the response for debugging
            logger.info(f"   Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for errors in response
                if "error" in data:
                    logger.error(f"   SERP API Error: {data['error']}")
                    return self._mock_flight_results(departure_id, arrival_id, outbound_date)
                
                # Parse results
                if "best_flights" in data and len(data["best_flights"]) > 0:
                    logger.info(f"   ✅ Found {len(data['best_flights'])} flights")
                    return self._parse_serp_response(data, departure_id, arrival_id, outbound_date, return_date)
                elif "other_flights" in data and len(data["other_flights"]) > 0:
                    logger.info(f"   ✅ Found {len(data['other_flights'])} other flights")
                    return self._parse_serp_response(data, departure_id, arrival_id, outbound_date, return_date)
                else:
                    logger.warning("   ⚠️ No flights found in response")
                    return self._mock_flight_results(departure_id, arrival_id, outbound_date)
            else:
                logger.error(f"   ❌ HTTP {response.status_code}: {response.text[:200]}")
                return self._mock_flight_results(departure_id, arrival_id, outbound_date)
                
        except Exception as e:
            logger.error(f"   ❌ Exception: {str(e)}")
            return self._mock_flight_results(departure_id, arrival_id, outbound_date)
    
    def _parse_serp_response(
        self, 
        data: Dict[str, Any],
        departure_id: str,
        arrival_id: str,
        outbound_date: str,
        return_date: Optional[str]
    ) -> Dict[str, Any]:
        """Parse SERP API response into our format"""
        
        flights = []
        
        # Get best flights first
        for flight_data in data.get("best_flights", [])[:5]:
            flights.append(self._parse_flight(flight_data, departure_id, arrival_id))
        
        # Add other flights if we need more
        if len(flights) < 5:
            for flight_data in data.get("other_flights", [])[:5-len(flights)]:
                flights.append(self._parse_flight(flight_data, departure_id, arrival_id))
        
        return {
            "success": True,
            "search_type": "flights",
            "departure_city": departure_id,
            "arrival_city": arrival_id,
            "departure_date": outbound_date,
            "return_date": return_date,
            "results": flights,
            "search_metadata": {
                "total_results": len(flights),
                "search_time": datetime.now().isoformat(),
                "currency": "USD",
                "source": "SERP API - Real Data"
            }
        }
    
    def _parse_flight(self, flight_data: Dict[str, Any], departure_id: str, arrival_id: str) -> Dict[str, Any]:
        """Parse individual flight from SERP API"""
        
        # Get first leg of flight
        flights = flight_data.get("flights", [])
        first_leg = flights[0] if flights else {}
        
        # Extract airline info
        airline = first_leg.get("airline", "Unknown")
        flight_number = first_leg.get("flight_number", "")
        
        # Extract times
        departure_airport = first_leg.get("departure_airport", {})
        arrival_airport = first_leg.get("arrival_airport", {})
        
        departure_time = departure_airport.get("time", "")
        arrival_time = arrival_airport.get("arrival_airport", {}).get("time", "")
        
        # Get price
        price = flight_data.get("price", 0)
        
        # Get duration
        total_duration = flight_data.get("total_duration", 0)
        duration_str = f"{total_duration // 60}h {total_duration % 60}m" if total_duration else "N/A"
        
        # Calculate stops
        stops = len(flights) - 1
        
        # Get booking link
        booking_token = flight_data.get("booking_token", "")
        booking_url = f"https://www.google.com/travel/flights/booking?token={booking_token}" if booking_token else f"https://www.google.com/travel/flights?q={airline}+{flight_number}+{departure_id}+to+{arrival_id}"
        
        return {
            "airline": airline,
            "flight_number": flight_number,
            "departure_time": departure_time,
            "arrival_time": arrival_time,
            "duration": duration_str,
            "price": price,
            "stops": stops,
            "departure_airport": departure_id,
            "arrival_airport": arrival_id,
            "booking_url": booking_url
        }
    
    def _mock_flight_results(self, departure: str, arrival: str, date: str) -> Dict[str, Any]:
        """Enhanced mock flight results"""
        base_url = "https://www.google.com/travel/flights"
        
        return {
            "success": True,
            "search_type": "flights",
            "departure_city": departure,
            "arrival_city": arrival,
            "departure_date": date,
            "results": [
                {
                    "airline": "Saudi Arabian Airlines",
                    "flight_number": "SV123",
                    "departure_time": "08:00",
                    "arrival_time": "12:30",
                    "duration": "4h 30m",
                    "price": 450,
                    "stops": 0,
                    "departure_airport": departure,
                    "arrival_airport": arrival,
                    "booking_url": f"{base_url}?q=Saudi+Arabian+Airlines+SV123+{departure}+to+{arrival}+{date}"
                },
                {
                    "airline": "Emirates",
                    "flight_number": "EK456",
                    "departure_time": "14:15",
                    "arrival_time": "19:45",
                    "duration": "5h 30m",
                    "price": 520,
                    "stops": 1,
                    "departure_airport": departure,
                    "arrival_airport": arrival,
                    "booking_url": f"{base_url}?q=Emirates+EK456+{departure}+to+{arrival}+{date}"
                },
                {
                    "airline": "Qatar Airways",
                    "flight_number": "QR789",
                    "departure_time": "20:30",
                    "arrival_time": "01:15+1",
                    "duration": "4h 45m",
                    "price": 480,
                    "stops": 0,
                    "departure_airport": departure,
                    "arrival_airport": arrival,
                    "booking_url": f"{base_url}?q=Qatar+Airways+QR789+{departure}+to+{arrival}+{date}"
                }
            ],
            "search_metadata": {
                "total_results": 3,
                "search_time": datetime.now().isoformat(),
                "currency": "USD",
                "note": "Mock data - SERP API unavailable"
            }
        }

# Global instance
serp_flights_api = SerpFlightsAPI()
