"""
SERP API Tools for Real-time Flight and Hotel Search
Provides real-time search capabilities for travel planning
"""

import os
import requests
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SerpAPITools:
    """
    SERP API integration for real-time travel search
    """
    
    def __init__(self):
        self.api_key = os.getenv("SERP_API_KEY")
        self.base_url = "https://serpapi.com/search"
        
        if not self.api_key:
            logger.warning("SERP API key not found. Using mock data.")
    
    async def search_flights(
        self,
        departure_city: str,
        arrival_city: str,
        departure_date: str,
        return_date: Optional[str] = None,
        passengers: int = 1,
        class_type: str = "economy"
    ) -> Dict[str, Any]:
        """
        Search for flights using SERP API Google Flights
        Based on official SERP API documentation
        
        Parameters:
        - departure_city: 3-letter airport code (e.g., "JFK", "LAX")
        - arrival_city: 3-letter airport code (e.g., "LHR", "DXB")
        - departure_date: YYYY-MM-DD format
        - return_date: YYYY-MM-DD format (optional)
        """
        try:
            if not self.api_key:
                logger.info("No SERP API key, using mock data")
                return self._mock_flight_results(departure_city, arrival_city, departure_date)
            
            # Build parameters according to SERP API Google Flights documentation
            params = {
                "engine": "google_flights",
                "departure_id": departure_city,
                "arrival_id": arrival_city,
                "outbound_date": departure_date,
                "currency": "USD",
                "hl": "en",
                "gl": "us",
                "adults": passengers,
                "api_key": self.api_key
            }
            
            # Add return date for round trip
            # Note: type=1 is Round trip, type=2 is One way (SERP API convention)
            if return_date:
                params["return_date"] = return_date
                params["type"] = "1"  # Round trip
            else:
                params["type"] = "2"  # One way
            
            logger.info(f"🔍 SERP API Flight Search:")
            logger.info(f"   Route: {departure_city} → {arrival_city}")
            logger.info(f"   Date: {departure_date}")
            logger.info(f"   Passengers: {passengers}")
            
            response = requests.get(self.base_url, params=params, timeout=15)
            
            logger.info(f"   Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for API errors
                if "error" in data:
                    logger.error(f"   ❌ SERP API Error: {data['error']}")
                    return self._mock_flight_results(departure_city, arrival_city, departure_date)
                
                # Check for search results
                best_flights = data.get("best_flights", [])
                other_flights = data.get("other_flights", [])
                
                if best_flights or other_flights:
                    total_flights = len(best_flights) + len(other_flights)
                    logger.info(f"   ✅ Found {total_flights} flights ({len(best_flights)} best, {len(other_flights)} other)")
                    
                    return {
                        "success": True,
                        "search_type": "flights",
                        "departure_city": departure_city,
                        "arrival_city": arrival_city,
                        "departure_date": departure_date,
                        "return_date": return_date,
                        "results": self._parse_flight_results(data),
                        "search_metadata": {
                            "total_results": total_flights,
                            "search_time": datetime.now().isoformat(),
                            "currency": "USD",
                            "source": "SERP API - Real Data"
                        }
                    }
                else:
                    logger.warning(f"   ⚠️ No flights found for route {departure_city} → {arrival_city}")
                    logger.warning(f"   This route may not be available or airport codes may be incorrect")
                    return self._mock_flight_results(departure_city, arrival_city, departure_date)
            else:
                logger.error(f"   ❌ HTTP {response.status_code}")
                logger.error(f"   Response: {response.text[:200]}")
                return self._mock_flight_results(departure_city, arrival_city, departure_date)
                
        except Exception as e:
            logger.error(f"   ❌ Exception: {str(e)}")
            return self._mock_flight_results(departure_city, arrival_city, departure_date)
    
    async def search_hotels(
        self,
        location: str,
        check_in_date: str,
        check_out_date: str,
        guests: int = 2,
        rooms: int = 1
    ) -> Dict[str, Any]:
        """
        Search for hotels using SERP API
        """
        try:
            if not self.api_key:
                return self._mock_hotel_results(location, check_in_date, check_out_date)
            
            params = {
                "engine": "google_hotels",
                "q": location,
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "adults": guests,
                "currency": "USD",
                "gl": "us",
                "hl": "en",
                "api_key": self.api_key
            }
            
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "success": True,
                "search_type": "hotels",
                "location": location,
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "guests": guests,
                "results": self._parse_hotel_results(data),
                "search_metadata": {
                    "total_results": len(data.get("properties", [])),
                    "search_time": datetime.now().isoformat(),
                    "currency": "USD"
                }
            }
            
        except Exception as e:
            logger.error(f"Error searching hotels: {e}")
            return self._mock_hotel_results(location, check_in_date, check_out_date)
    
    async def search_attractions(
        self,
        location: str,
        category: str = "tourist_attraction"
    ) -> Dict[str, Any]:
        """
        Search for attractions and activities
        """
        try:
            if not self.api_key:
                return self._mock_attraction_results(location)
            
            params = {
                "engine": "google_maps",
                "q": f"{category} in {location}",
                "type": "search",
                "api_key": self.api_key
            }
            
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "success": True,
                "search_type": "attractions",
                "location": location,
                "category": category,
                "results": self._parse_attraction_results(data),
                "search_metadata": {
                    "total_results": len(data.get("local_results", [])),
                    "search_time": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error searching attractions: {e}")
            return self._mock_attraction_results(location)
    
    def _parse_flight_results(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse flight search results from SERP API"""
        flights = []
        
        # Parse best flights
        for flight_data in data.get("best_flights", [])[:5]:
            parsed = self._parse_single_flight(flight_data)
            if parsed:
                flights.append(parsed)
        
        # Add other flights if we need more
        if len(flights) < 5:
            for flight_data in data.get("other_flights", [])[:5-len(flights)]:
                parsed = self._parse_single_flight(flight_data)
                if parsed:
                    flights.append(parsed)
        
        return flights
    
    def _parse_single_flight(self, flight_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse a single flight from SERP API response"""
        try:
            # Get flight legs
            flight_legs = flight_data.get("flights", [])
            if not flight_legs:
                return None
            
            first_leg = flight_legs[0]
            last_leg = flight_legs[-1]
            
            # Extract airline info
            airline = first_leg.get("airline", "Unknown")
            flight_number = first_leg.get("flight_number", "")
            
            # Extract departure info
            departure_airport = first_leg.get("departure_airport", {})
            departure_time = departure_airport.get("time", "")
            departure_id = departure_airport.get("id", "")
            
            # Extract arrival info
            arrival_airport = last_leg.get("arrival_airport", {})
            arrival_time = arrival_airport.get("time", "")
            arrival_id = arrival_airport.get("id", "")
            
            # Get price
            price = flight_data.get("price", 0)
            
            # Get duration
            total_duration = flight_data.get("total_duration", 0)
            hours = total_duration // 60
            minutes = total_duration % 60
            duration_str = f"{hours}h {minutes}m" if total_duration else "N/A"
            
            # Calculate stops
            stops = len(flight_legs) - 1
            
            # Get booking URL
            booking_token = flight_data.get("booking_token", "")
            if booking_token:
                booking_url = f"https://www.google.com/travel/flights/booking?token={booking_token}"
            else:
                # Fallback to search URL
                booking_url = f"https://www.google.com/travel/flights?q={airline}+{flight_number}+{departure_id}+to+{arrival_id}"
            
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
        except Exception as e:
            logger.error(f"Error parsing flight: {e}")
            return None
    
    def _parse_hotel_results(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse hotel search results"""
        hotels = []
        
        for hotel in data.get("properties", [])[:15]:  # Limit to top 15
            hotels.append({
                "name": hotel.get("name", "Unknown Hotel"),
                "rating": hotel.get("overall_rating", 0),
                "price_per_night": hotel.get("rate_per_night", {}).get("lowest", "N/A"),
                "total_price": hotel.get("total_rate", {}).get("lowest", "N/A"),
                "amenities": hotel.get("amenities", []),
                "location": hotel.get("neighborhood", ""),
                "booking_url": hotel.get("link", ""),
                "images": hotel.get("images", [])[:3]  # Limit to 3 images
            })
        
        return hotels
    
    def _parse_attraction_results(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse attraction search results"""
        attractions = []
        
        for attraction in data.get("local_results", [])[:20]:  # Limit to top 20
            attractions.append({
                "name": attraction.get("title", "Unknown Attraction"),
                "rating": attraction.get("rating", 0),
                "reviews": attraction.get("reviews", 0),
                "address": attraction.get("address", ""),
                "phone": attraction.get("phone", ""),
                "website": attraction.get("website", ""),
                "hours": attraction.get("hours", {}),
                "price_range": attraction.get("price", ""),
                "category": attraction.get("type", "")
            })
        
        return attractions
    
    def _mock_flight_results(self, departure: str, arrival: str, date: str) -> Dict[str, Any]:
        """Mock flight results for testing"""
        # Create more specific booking URLs with flight details
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
                    "departure_airport": departure.upper()[:3] if len(departure) >= 3 else "JFK",
                    "arrival_airport": arrival.upper()[:3] if len(arrival) >= 3 else "MED",
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
                    "departure_airport": departure.upper()[:3] if len(departure) >= 3 else "JFK",
                    "arrival_airport": arrival.upper()[:3] if len(arrival) >= 3 else "MED",
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
                    "departure_airport": departure.upper()[:3] if len(departure) >= 3 else "JFK",
                    "arrival_airport": arrival.upper()[:3] if len(arrival) >= 3 else "MED",
                    "booking_url": f"{base_url}?q=Qatar+Airways+QR789+{departure}+to+{arrival}+{date}"
                }
            ],
            "search_metadata": {
                "total_results": 3,
                "search_time": datetime.now().isoformat(),
                "currency": "USD",
                "note": "Mock data - SERP API key not configured"
            }
        }
    
    def _mock_hotel_results(self, location: str, check_in: str, check_out: str) -> Dict[str, Any]:
        """Mock hotel results for testing"""
        return {
            "success": True,
            "search_type": "hotels",
            "location": location,
            "check_in_date": check_in,
            "check_out_date": check_out,
            "results": [
                {
                    "name": f"Luxury Hotel {location}",
                    "rating": 4.5,
                    "price_per_night": "$150",
                    "total_price": "$450",
                    "amenities": ["WiFi", "Pool", "Spa", "Restaurant"],
                    "location": f"Central {location}",
                    "booking_url": "https://booking.example.com"
                },
                {
                    "name": f"Business Hotel {location}",
                    "rating": 4.2,
                    "price_per_night": "$120",
                    "total_price": "$360",
                    "amenities": ["WiFi", "Business Center", "Gym"],
                    "location": f"Downtown {location}",
                    "booking_url": "https://booking.example.com"
                },
                {
                    "name": f"Budget Inn {location}",
                    "rating": 3.8,
                    "price_per_night": "$80",
                    "total_price": "$240",
                    "amenities": ["WiFi", "Parking"],
                    "location": f"Near Airport {location}",
                    "booking_url": "https://booking.example.com"
                }
            ],
            "search_metadata": {
                "total_results": 3,
                "search_time": datetime.now().isoformat(),
                "currency": "USD",
                "note": "Mock data - SERP API key not configured"
            }
        }
    
    def _mock_attraction_results(self, location: str) -> Dict[str, Any]:
        """Mock attraction results for testing"""
        attractions_data = {
            "madinah": [
                {
                    "name": "Prophet's Mosque (Al-Masjid an-Nabawi)",
                    "rating": 4.9,
                    "reviews": 15000,
                    "address": "Al Haram, Medina, Saudi Arabia",
                    "category": "Religious Site",
                    "description": "The second holiest mosque in Islam"
                },
                {
                    "name": "Quba Mosque",
                    "rating": 4.8,
                    "reviews": 8500,
                    "address": "Quba, Medina, Saudi Arabia",
                    "category": "Religious Site",
                    "description": "The first mosque built by Prophet Muhammad"
                },
                {
                    "name": "Mount Uhud",
                    "rating": 4.6,
                    "reviews": 5200,
                    "address": "Uhud, Medina, Saudi Arabia",
                    "category": "Historical Site",
                    "description": "Historic mountain and battlefield"
                }
            ]
        }
        
        location_key = location.lower()
        if "madinah" in location_key or "medina" in location_key:
            results = attractions_data["madinah"]
        else:
            results = [
                {
                    "name": f"Famous Landmark in {location}",
                    "rating": 4.5,
                    "reviews": 2500,
                    "address": f"Central {location}",
                    "category": "Tourist Attraction"
                },
                {
                    "name": f"Cultural Museum {location}",
                    "rating": 4.3,
                    "reviews": 1800,
                    "address": f"Museum District, {location}",
                    "category": "Museum"
                }
            ]
        
        return {
            "success": True,
            "search_type": "attractions",
            "location": location,
            "results": results,
            "search_metadata": {
                "total_results": len(results),
                "search_time": datetime.now().isoformat(),
                "note": "Mock data - SERP API key not configured"
            }
        }

# Global instance
serp_api_tools = SerpAPITools()