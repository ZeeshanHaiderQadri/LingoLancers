'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Hotel,
  Plane,
  DollarSign,
  Clock,
  Star,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react'

interface TravelPlanReviewProps {
  travelPlan: any
  onBack?: () => void
  onNewPlan?: () => void
}

export function TravelPlanReview({ travelPlan, onBack, onNewPlan }: TravelPlanReviewProps) {
  const handleDownload = () => {
    // TODO: Implement PDF download
    console.log('Download travel plan')
  }

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share travel plan')
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="p-6 border-b bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h2 className="text-2xl font-bold">Your Travel Plan</h2>
              <p className="text-sm text-muted-foreground">
                {travelPlan?.destination || 'Travel Itinerary'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            {onNewPlan && (
              <Button onClick={onNewPlan}>
                Plan Another Trip
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Trip Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Trip Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{travelPlan?.duration || '7 days'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Budget</p>
                    <p className="font-semibold">{travelPlan?.budget || '$2,500'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Trip Type</p>
                    <p className="font-semibold">{travelPlan?.type || 'Leisure'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flights */}
          {travelPlan?.flights && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Flight Options
                </CardTitle>
                <CardDescription>Best flight options for your trip</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {travelPlan.flights.map((flight: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{flight.airline}</p>
                            <p className="text-sm text-muted-foreground">
                              {flight.departure} → {flight.arrival}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{flight.duration}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">${flight.price}</p>
                            <Button size="sm" className="mt-2">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Accommodation */}
          {travelPlan?.hotels && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Accommodation
                </CardTitle>
                <CardDescription>Recommended hotels for your stay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {travelPlan.hotels.map((hotel: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {hotel.image && (
                            <img 
                              src={hotel.image} 
                              alt={hotel.name}
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{hotel.name}</h4>
                                <p className="text-sm text-muted-foreground">{hotel.location}</p>
                                <div className="flex items-center gap-1 mt-2">
                                  {Array.from({ length: hotel.stars || 4 }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold">${hotel.pricePerNight}</p>
                                <p className="text-sm text-muted-foreground">per night</p>
                              </div>
                            </div>
                            <Button size="sm" className="mt-3">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Day-by-Day Itinerary */}
          {travelPlan?.itinerary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Day-by-Day Itinerary
                </CardTitle>
                <CardDescription>Your complete travel schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {travelPlan.itinerary.map((day: any, index: number) => (
                    <div key={index}>
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-blue-100 text-blue-700">
                          Day {index + 1}
                        </Badge>
                        <h4 className="font-semibold">{day.title}</h4>
                      </div>
                      <div className="space-y-3 ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                        {day.activities?.map((activity: any, actIndex: number) => (
                          <div key={actIndex} className="relative">
                            <div className="absolute -left-[1.3rem] top-2 w-3 h-3 rounded-full bg-blue-500" />
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                              <div>
                                <p className="text-sm text-muted-foreground">{activity.time}</p>
                                <p className="font-medium">{activity.name}</p>
                                <p className="text-sm text-muted-foreground">{activity.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {index < travelPlan.itinerary.length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Budget Breakdown */}
          {travelPlan?.budgetBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Breakdown
                </CardTitle>
                <CardDescription>Estimated costs for your trip</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(travelPlan.budgetBreakdown).map(([category, amount]: [string, any]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{category}</span>
                      <span className="font-semibold">${amount}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${travelPlan.budget || '2,500'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
