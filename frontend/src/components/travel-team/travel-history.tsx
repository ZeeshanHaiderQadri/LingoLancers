"use client";

import React from "react";
import { TravelPlanCard } from "./travel-plan-card";
import { TravelPlanSkeletonGrid } from "./travel-plan-skeleton";

interface TravelHistoryProps {
  plans: any[];
  onPlansChange: (plans: any[]) => void;
  isLoading?: boolean;
}

export function TravelHistory({ plans, onPlansChange, isLoading = false }: TravelHistoryProps) {
  const handleDelete = async (planId: string) => {
    try {
      const { travelAPI } = await import("@/lib/travel-api");
      const result = await travelAPI.deleteTravelPlan(planId);
      
      if (result.success) {
        // Remove from local state
        const updatedPlans = plans.filter((p) => p.id !== planId);
        onPlansChange(updatedPlans);
      } else {
        console.error("Failed to delete travel plan:", result.error);
        // Fallback to localStorage
        const updatedPlans = plans.filter((p) => p.id !== planId);
        onPlansChange(updatedPlans);
        localStorage.setItem("travel_plans", JSON.stringify(updatedPlans));
      }
    } catch (error) {
      console.error("Error deleting travel plan:", error);
      // Fallback to localStorage
      const updatedPlans = plans.filter((p) => p.id !== planId);
      onPlansChange(updatedPlans);
      localStorage.setItem("travel_plans", JSON.stringify(updatedPlans));
    }
  };

  // Show skeleton loading
  if (isLoading) {
    return <TravelPlanSkeletonGrid count={3} />;
  }

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">✈️</div>
        <h3 className="text-xl font-semibold mb-2">No Travel Plans Yet</h3>
        <p className="text-muted-foreground">
          Create your first travel plan to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Your Travel Plans</h3>
        <span className="text-sm text-muted-foreground">
          {plans.length} {plans.length === 1 ? "plan" : "plans"}
        </span>
      </div>
      <div className="grid gap-4">
        {plans.map((plan) => (
          <TravelPlanCard key={plan.id} plan={plan} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
