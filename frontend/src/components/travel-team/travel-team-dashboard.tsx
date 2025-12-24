"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Calendar, History } from "lucide-react";
import { TravelCreationForm } from "./travel-creation-form";
import { TravelHistory } from "./travel-history";
import BookingWidgets from "../booking-widgets";

interface TravelTeamDashboardProps {
  className?: string;
}

export function TravelTeamDashboard({ className = "" }: TravelTeamDashboardProps) {
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load workflow data if coming from chat
  useEffect(() => {
    const workflowData = sessionStorage.getItem("workflow_data");
    if (workflowData) {
      try {
        const data = JSON.parse(workflowData);
        console.log("📦 Travel workflow data loaded:", data);
        // Data will be passed to form
      } catch (e) {
        console.error("Error parsing workflow data:", e);
      }
    }

    // Load saved plans from backend API
    loadTravelPlans();
  }, []);

  const loadTravelPlans = async () => {
    try {
      setIsLoading(true);
      const { travelAPI } = await import("@/lib/travel-api");
      const result = await travelAPI.getAllTravelPlans();
      
      if (result.success && result.data) {
        setPlans(result.data);
      } else {
        console.error("Failed to load travel plans:", result.error);
        // Fallback to localStorage for backward compatibility
        const savedPlans = localStorage.getItem("travel_plans");
        if (savedPlans) {
          try {
            setPlans(JSON.parse(savedPlans));
          } catch (e) {
            console.error("Error loading plans from localStorage:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error loading travel plans:", error);
      // Fallback to localStorage
      const savedPlans = localStorage.getItem("travel_plans");
      if (savedPlans) {
        try {
          setPlans(JSON.parse(savedPlans));
        } catch (e) {
          console.error("Error loading plans from localStorage:", e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanCreated = async (newPlan: any) => {
    try {
      const { travelAPI } = await import("@/lib/travel-api");
      const result = await travelAPI.createTravelPlan({
        departure: newPlan.departure,
        destination: newPlan.destination,
        start_date: newPlan.startDate,
        end_date: newPlan.endDate,
        adults: parseInt(newPlan.adults || "1"),
        children: parseInt(newPlan.children || "0"),
        budget: newPlan.budget,
        preferences: newPlan.preferences,
        status: newPlan.status || "planning",
        task_id: newPlan.taskId
      });

      if (result.success && result.data) {
        // Reload plans from backend
        await loadTravelPlans();
        setActiveTab("history");
      } else {
        console.error("Failed to create travel plan:", result.error);
        // Fallback to localStorage
        const updatedPlans = [newPlan, ...plans];
        setPlans(updatedPlans);
        localStorage.setItem("travel_plans", JSON.stringify(updatedPlans));
        setActiveTab("history");
      }
    } catch (error) {
      console.error("Error creating travel plan:", error);
      // Fallback to localStorage
      const updatedPlans = [newPlan, ...plans];
      setPlans(updatedPlans);
      localStorage.setItem("travel_plans", JSON.stringify(updatedPlans));
      setActiveTab("history");
    }
  };

  return (
    <div className={`h-full flex flex-col overflow-auto ${className}`}>
      {/* Expedia Banners - At Very Top */}
      <div className="mb-6">
        <BookingWidgets widgets={[]} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Plane className="h-8 w-8 text-primary" />
            Travel Planning
          </h1>
          <p className="text-muted-foreground mt-1">
            Plan your perfect trip with AI-powered assistance
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="create" className="gap-2">
            <Calendar className="h-4 w-4" />
            New Plan
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History ({plans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="flex-1 overflow-auto">
          <TravelCreationForm onPlanCreated={handlePlanCreated} />
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-auto">
          <TravelHistory plans={plans} onPlansChange={setPlans} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
