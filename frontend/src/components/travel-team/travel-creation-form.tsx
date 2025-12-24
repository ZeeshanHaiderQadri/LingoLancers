"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, MapPin, Users, DollarSign, Sparkles, Baby } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface TravelCreationFormProps {
  onPlanCreated: (plan: any) => void;
}

export function TravelCreationForm({ onPlanCreated }: TravelCreationFormProps) {
  const [formData, setFormData] = useState({
    departure: "",
    destination: "",
    startDate: "",
    endDate: "",
    adults: "1",
    children: "0",
    budget: "",
    preferences: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data from chat if available
  useEffect(() => {
    const workflowData = sessionStorage.getItem("workflow_data");
    if (workflowData) {
      try {
        const data = JSON.parse(workflowData);
        setFormData((prev) => ({
          ...prev,
          departure: data.departure || prev.departure,
          destination: data.destination || prev.destination,
          startDate: data.startDate || prev.startDate,
          endDate: data.endDate || prev.endDate,
          adults: data.adults || prev.adults,
          children: data.children || prev.children,
          budget: data.budget || prev.budget,
          preferences: data.preferences || prev.preferences,
        }));
      } catch (e) {
        console.error("Error loading workflow data:", e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create plan object
    const newPlan = {
      id: crypto.randomUUID(),
      ...formData,
      createdAt: new Date().toISOString(),
      status: "planning",
    };

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onPlanCreated(newPlan);
    setIsSubmitting(false);

    // Reset form
    setFormData({
      departure: "",
      destination: "",
      startDate: "",
      endDate: "",
      adults: "1",
      children: "0",
      budget: "",
      preferences: "",
    });

    // Clear workflow data
    sessionStorage.removeItem("workflow_data");
  };

  const handleStartWorkflow = async () => {
    if (!formData.destination) {
      alert("Please enter a destination first");
      return;
    }

    setIsSubmitting(true);

    try {
      // Import lingoAPI dynamically
      const { lingoAPI } = await import("@/lib/lingo-api");

      // Create user input for the workflow
      const totalTravelers = parseInt(formData.adults) + parseInt(formData.children);
      const travelerDetails = `${formData.adults} adult${parseInt(formData.adults) > 1 ? 's' : ''}${
        parseInt(formData.children) > 0 ? ` and ${formData.children} child${parseInt(formData.children) > 1 ? 'ren' : ''}` : ''
      }`;
      
      const userInput = `Plan a trip${formData.departure ? ` from ${formData.departure}` : ""} to ${formData.destination}${
        formData.startDate ? ` from ${formData.startDate}` : ""
      }${formData.endDate ? ` to ${formData.endDate}` : ""} for ${travelerDetails}${
        formData.budget ? ` with a budget of $${formData.budget}` : ""
      }${formData.preferences ? `. Preferences: ${formData.preferences}` : ""}`;

      // Launch the travel planning team
      const result = await lingoAPI.launchTeam("travel_planning", userInput, "high");

      if (result.success && result.data?.task_id) {
        // Create and save the plan
        const newPlan = {
          id: crypto.randomUUID(),
          ...formData,
          createdAt: new Date().toISOString(),
          status: "planning",
          taskId: result.data.task_id,
        };

        onPlanCreated(newPlan);

        // Navigate to the workflow dashboard
        // Dispatch event to open the team dashboard with task ID
        window.dispatchEvent(
          new CustomEvent("open-team-dashboard", {
            detail: {
              teamName: "TRAVEL PLANNING",
              taskId: result.data.task_id,
            },
          })
        );

        // Reset form
        setFormData({
          departure: "",
          destination: "",
          startDate: "",
          endDate: "",
          adults: "1",
          children: "0",
          budget: "",
          preferences: "",
        });
      } else {
        throw new Error(result.error || "Failed to start workflow");
      }
    } catch (error: any) {
      console.error("Workflow launch error:", error);
      alert(`Failed to start workflow: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create Your Travel Plan
          </CardTitle>
          <CardDescription>
            Fill in the details below and let our AI help you plan the perfect trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Departure and Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Departure From
                </Label>
                <Input
                  id="departure"
                  placeholder="e.g., New York, USA"
                  value={formData.departure}
                  onChange={(e) => handleChange("departure", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Destination
                </Label>
                <Input
                  id="destination"
                  placeholder="e.g., Paris, France"
                  value={formData.destination}
                  onChange={(e) => handleChange("destination", e.target.value)}
                  required
                />
              </div>
            </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !formData.startDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(new Date(formData.startDate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate ? new Date(formData.startDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        handleChange("startDate", format(date, "yyyy-MM-dd"));
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !formData.endDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(new Date(formData.endDate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate ? new Date(formData.endDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        handleChange("endDate", format(date, "yyyy-MM-dd"));
                      }
                    }}
                    disabled={(date) => {
                      const minDate = formData.startDate 
                        ? new Date(formData.startDate)
                        : new Date(new Date().setHours(0, 0, 0, 0));
                      return date < minDate;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Travelers */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Travelers
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults" className="text-sm text-muted-foreground">
                  Adults
                </Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.adults}
                  onChange={(e) => handleChange("adults", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="children" className="text-sm text-muted-foreground flex items-center gap-1">
                  <Baby className="h-3 w-3" />
                  Children
                </Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.children}
                  onChange={(e) => handleChange("children", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Budget (USD)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g., 5000"
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <Label htmlFor="preferences">Preferences & Notes</Label>
            <Textarea
              id="preferences"
              placeholder="Any special requirements, interests, or preferences..."
              value={formData.preferences}
              onChange={(e) => handleChange("preferences", e.target.value)}
              rows={4}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              onClick={handleStartWorkflow}
              disabled={isSubmitting || !formData.destination}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Starting AI Workflow...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start AI Travel Planning Workflow
                </>
              )}
            </Button>
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} variant="outline" className="flex-1">
                {isSubmitting ? "Saving..." : "Save Plan Only"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setFormData({
                    departure: "",
                    destination: "",
                    startDate: "",
                    endDate: "",
                    adults: "1",
                    children: "0",
                    budget: "",
                    preferences: "",
                  });
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
