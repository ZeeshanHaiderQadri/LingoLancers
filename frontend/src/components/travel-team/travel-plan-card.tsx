"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MapPin, Calendar, Users, DollarSign, Trash2, Eye, AlertTriangle, Sparkles } from "lucide-react";

interface TravelPlanCardProps {
  plan: any;
  onDelete: (planId: string) => void;
}

export function TravelPlanCard({ plan, onDelete }: TravelPlanCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showNoWorkflowDialog, setShowNoWorkflowDialog] = useState(false);
  const [showPlanDetailsDialog, setShowPlanDetailsDialog] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      // Simple format to avoid hydration issues
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } catch (error) {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-500/10 text-blue-500";
      case "booked":
        return "bg-green-500/10 text-green-500";
      case "completed":
        return "bg-gray-500/10 text-gray-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const hasValidWorkflow = () => {
    // Check both camelCase and snake_case for compatibility
    const taskId = plan.taskId || plan.task_id;
    return taskId && 
           taskId.trim() && 
           taskId !== 'undefined' && 
           taskId !== 'null' &&
           taskId.length > 5; // Reduced from 10 to 5 to catch valid task IDs
  };

  const handleStartWorkflow = async () => {
    try {
      // Import lingoAPI dynamically
      const { lingoAPI } = await import("@/lib/lingo-api");

      // Create user input for the workflow using plan data
      const totalTravelers = parseInt(plan.adults || "1") + parseInt(plan.children || "0");
      const travelerDetails = `${plan.adults || "1"} adult${parseInt(plan.adults || "1") > 1 ? 's' : ''}${
        parseInt(plan.children || "0") > 0 ? ` and ${plan.children} child${parseInt(plan.children) > 1 ? 'ren' : ''}` : ''
      }`;
      
      const userInput = `Plan a trip${plan.departure ? ` from ${plan.departure}` : ""} to ${plan.destination}${
        (plan.start_date || plan.startDate) ? ` from ${plan.start_date || plan.startDate}` : ""
      }${(plan.end_date || plan.endDate) ? ` to ${plan.end_date || plan.endDate}` : ""} for ${travelerDetails}${
        plan.budget ? ` with a budget of $${plan.budget}` : ""
      }${plan.preferences ? `. Preferences: ${plan.preferences}` : ""}`;

      // Launch the travel planning team
      const result = await lingoAPI.launchTeam("travel_planning", userInput, "high");

      if (result.success && result.data?.task_id) {
        // Update the plan with the new taskId
        const { travelAPI } = await import("@/lib/travel-api");
        await travelAPI.updateTravelPlan(plan.id, {
          task_id: result.data.task_id,
          status: "processing"
        });

        // Navigate to the workflow dashboard
        window.dispatchEvent(
          new CustomEvent("open-team-dashboard", {
            detail: {
              teamName: "TRAVEL PLANNING",
              taskId: result.data.task_id,
            },
          })
        );
      } else {
        throw new Error(result.error || "Failed to start workflow");
      }
    } catch (error: any) {
      console.error("Workflow launch error:", error);
      alert(`Failed to start workflow: ${error.message}`);
    }
  };

  return (
    <Card className="hover:border-primary/50 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-5 w-5 text-primary" />
              {plan.destination}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(plan.startDate || plan.start_date)} - {formatDate(plan.endDate || plan.end_date)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {(parseInt(plan.adults || "1") + parseInt(plan.children || "0"))} travelers
              </span>
              {plan.budget && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ${parseInt(plan.budget).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <Badge className={getStatusColor(plan.status)}>
            {plan.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {plan.preferences && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {plan.preferences}
          </p>
        )}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => {
              if (hasValidWorkflow()) {
                // Open the workflow dashboard for plans with valid workflows
                const taskId = plan.taskId || plan.task_id;
                window.dispatchEvent(
                  new CustomEvent("open-team-dashboard", {
                    detail: {
                      teamName: "TRAVEL PLANNING",
                      taskId: taskId,
                    },
                  })
                );
              } else {
                // Show plan details modal for plans without valid workflows
                setShowPlanDetailsDialog(true);
              }
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            {hasValidWorkflow() ? 'View Workflow' : 'View Details'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog - Glassmorphism */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="backdrop-blur-xl bg-background/80 border-2 border-red-500/20">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-red-500/10 p-3">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <AlertDialogTitle className="text-xl">Delete Travel Plan?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete your trip to <span className="font-semibold text-foreground">{plan.destination}</span>? 
              This action cannot be undone and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-muted">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(plan.id)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* No Workflow Dialog - Glassmorphism */}
      <AlertDialog open={showNoWorkflowDialog} onOpenChange={setShowNoWorkflowDialog}>
        <AlertDialogContent className="backdrop-blur-xl bg-background/80 border-2 border-blue-500/20">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-blue-500/10 p-3">
                <Eye className="h-6 w-6 text-blue-500" />
              </div>
              <AlertDialogTitle className="text-xl">No Workflow Available</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              This travel plan doesn't have an associated AI workflow yet. 
              Start a new workflow by clicking <span className="font-semibold text-foreground">"Start AI Travel Planning Workflow"</span> from the New Plan tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-primary hover:bg-primary/90">
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Plan Details Dialog - Glassmorphism */}
      <AlertDialog open={showPlanDetailsDialog} onOpenChange={setShowPlanDetailsDialog}>
        <AlertDialogContent className="backdrop-blur-xl bg-background/80 border-2 border-primary/20 max-w-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-primary/10 p-3">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <AlertDialogTitle className="text-xl">Trip to {plan.destination}</AlertDialogTitle>
            </div>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {plan.departure && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Departure From</h4>
                  <p className="text-base">{plan.departure}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Destination</h4>
                <p className="text-base">{plan.destination}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Travel Dates</h4>
                <p className="text-base">
                  {formatDate(plan.startDate || plan.start_date)} - {formatDate(plan.endDate || plan.end_date)}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Travelers</h4>
                <p className="text-base">
                  {plan.adults || "1"} adult{parseInt(plan.adults || "1") > 1 ? "s" : ""}
                  {plan.children && parseInt(plan.children) > 0 && `, ${plan.children} child${parseInt(plan.children) > 1 ? "ren" : ""}`}
                </p>
              </div>
            </div>

            {plan.budget && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Budget</h4>
                <p className="text-base">${parseInt(plan.budget).toLocaleString()}</p>
              </div>
            )}

            {plan.preferences && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Preferences & Notes</h4>
                <p className="text-base">{plan.preferences}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Status</h4>
                <Badge className={getStatusColor(plan.status)}>
                  {plan.status}
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">AI Workflow</h4>
                <Badge className={hasValidWorkflow() ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}>
                  {hasValidWorkflow() ? "Active" : "Not Started"}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Created</h4>
              <p className="text-base">{formatDate(plan.createdAt || plan.created_at)}</p>
            </div>

            {!hasValidWorkflow() && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                      Ready for AI Planning
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Start an AI workflow to get personalized recommendations, itineraries, and booking assistance for your trip.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <AlertDialogFooter className="flex gap-2">
            {!hasValidWorkflow() && (
              <AlertDialogAction 
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                onClick={async (e) => {
                  e.preventDefault();
                  setShowPlanDetailsDialog(false);
                  await handleStartWorkflow();
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Start AI Workflow
              </AlertDialogAction>
            )}
            <AlertDialogCancel className="bg-secondary hover:bg-secondary/90">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
