/**
 * Dynamic Booking Widgets Component
 * Displays flight and hotel booking widgets from SERP API data
 */

'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Plane, 
  Hotel, 
  Star, 
  Clock, 
  MapPin, 
  ExternalLink,
  Wifi,
  Car,
  Coffee,
  Utensils
} from 'lucide-react';

interface FlightWidget {
  type: 'flight_booking';
  id: string;
  data: {
    airline: string;
    flight_number: string;
    departure_time: string;
    arrival_time: string;
    duration: string;
    price: number;
    stops: number;
    booking_url: string;
  };
  priority: number;
}

interface HotelWidget {
  type: 'hotel_booking';
  id: string;
  data: {
    name: string;
    rating: number;
    price_per_night: string;
    total_price: string;
    amenities: string[];
    location: string;
    booking_url: string;
    images?: string[];
  };
  priority: number;
}

type BookingWidget = FlightWidget | HotelWidget;

interface BookingWidgetsProps {
  widgets: BookingWidget[];
  className?: string;
}

const FlightBookingCard: React.FC<{ widget: FlightWidget }> = ({ widget }) => {
  const { data } = widget;
  
  const handleBooking = () => {
    if (data.booking_url && data.booking_url !== '#') {
      window.open(data.booking_url, '_blank');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">
              {data.airline} {data.flight_number}
            </CardTitle>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ${data.price}
            </div>
            <div className="text-sm text-muted-foreground">per person</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Departure</div>
            <div className="font-semibold">{data.departure_time}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Arrival</div>
            <div className="font-semibold">{data.arrival_time}</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{data.duration}</span>
          </div>
          <div>
            {data.stops === 0 ? (
              <Badge variant="secondary">Direct</Badge>
            ) : (
              <Badge variant="outline">{data.stops} stop{data.stops > 1 ? 's' : ''}</Badge>
            )}
          </div>
        </div>
        
        <Button 
          onClick={handleBooking}
          className="w-full"
          disabled={!data.booking_url || data.booking_url === '#'}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Book Flight
        </Button>
      </CardContent>
    </Card>
  );
};

const HotelBookingCard: React.FC<{ widget: HotelWidget }> = ({ widget }) => {
  const { data } = widget;
  
  const handleBooking = () => {
    if (data.booking_url && data.booking_url !== '#') {
      window.open(data.booking_url, '_blank');
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi className="w-4 h-4" />;
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return <Car className="w-4 h-4" />;
    if (amenityLower.includes('breakfast') || amenityLower.includes('restaurant')) return <Utensils className="w-4 h-4" />;
    if (amenityLower.includes('coffee')) return <Coffee className="w-4 h-4" />;
    return null;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hotel className="w-5 h-5 text-purple-600" />
            <div>
              <CardTitle className="text-lg">{data.name}</CardTitle>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{data.rating}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-green-600">
              {data.price_per_night}
            </div>
            <div className="text-sm text-muted-foreground">per night</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {data.location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{data.location}</span>
          </div>
        )}
        
        {data.total_price && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Price</div>
            <div className="text-lg font-semibold">{data.total_price}</div>
          </div>
        )}
        
        {data.amenities && data.amenities.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Amenities</div>
            <div className="flex flex-wrap gap-2">
              {data.amenities.slice(0, 4).map((amenity, index) => (
                <div key={index} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                  {getAmenityIcon(amenity)}
                  <span>{amenity}</span>
                </div>
              ))}
              {data.amenities.length > 4 && (
                <div className="text-xs text-muted-foreground px-2 py-1">
                  +{data.amenities.length - 4} more
                </div>
              )}
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleBooking}
          className="w-full"
          disabled={!data.booking_url || data.booking_url === '#'}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Book Hotel
        </Button>
      </CardContent>
    </Card>
  );
};

// Expedia Affiliate Banners Component - Clickable with Affiliate Tracking
const ExpediaBanners: React.FC = () => {
  const handleFlightClick = () => {
    window.open('https://www.expedia.com/Flights?camref=1101l46BtI&pubref=hnt-limited', '_blank');
  };

  const handleHotelClick = () => {
    window.open('https://www.expedia.com/Hotels?camref=1101l46BtI&pubref=hnt-limited', '_blank');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Flight Search Banner with Affiliate Tracking */}
      <button
        onClick={handleFlightClick}
        className="w-full group relative overflow-hidden rounded-lg border-2 border-blue-500/20 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-white/10 p-3">
            <Plane className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">Search Flights</h3>
            <p className="text-sm text-white/90 mt-1">Find the best flight deals on Expedia</p>
          </div>
          <ExternalLink className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
        </div>
      </button>

      {/* Hotel Search Banner with Affiliate Tracking */}
      <button
        onClick={handleHotelClick}
        className="w-full group relative overflow-hidden rounded-lg border-2 border-purple-500/20 bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-white/10 p-3">
            <Hotel className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">Search Hotels</h3>
            <p className="text-sm text-white/90 mt-1">Find the perfect accommodation on Expedia</p>
          </div>
          <ExternalLink className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
        </div>
      </button>
    </div>
  );
};

export default function BookingWidgets({ widgets, className = "" }: BookingWidgetsProps) {
  // Always show Expedia banners
  const showExpediaBanners = !widgets || widgets.length === 0;

  // Separate flight and hotel widgets
  const flightWidgets = widgets?.filter(w => w.type === 'flight_booking') as FlightWidget[] || [];
  const hotelWidgets = widgets?.filter(w => w.type === 'hotel_booking') as HotelWidget[] || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Always show Expedia affiliate banners */}
      {showExpediaBanners && <ExpediaBanners />}

      {flightWidgets.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-600" />
            Available Flights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flightWidgets
              .sort((a, b) => a.priority - b.priority)
              .map((widget) => (
                <FlightBookingCard key={widget.id} widget={widget} />
              ))}
          </div>
        </div>
      )}

      {hotelWidgets.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Hotel className="w-5 h-5 text-purple-600" />
            Recommended Hotels
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotelWidgets
              .sort((a, b) => a.priority - b.priority)
              .map((widget) => (
                <HotelBookingCard key={widget.id} widget={widget} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export type { BookingWidget, FlightWidget, HotelWidget };