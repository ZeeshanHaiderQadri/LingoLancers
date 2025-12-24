/**
 * Microsoft Agent Framework Workflow Progress Component
 * Shows step-by-step progress of sequential agent workflows
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Bot,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  ArrowRight,
  MapPin,
  Search,
  FileText,
  Plane,
  Users,
  Globe,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  status: "pending" | "running" | "completed" | "failed";
  startTime?: Date;
  endTime?: Date;
  result?: any;
  description: string;
  icon: React.ReactNode;
}

interface WorkflowProgressProps {
  teamName: string;
  taskId: string;
  workflowData?: any;
  onStepComplete?: (step: WorkflowStep) => void;
}

const getStepIcon = (stepId: string, status: string) => {
  const iconProps = { className: "w-5 h-5" };

  if (status === "running") {
    return (
      <Loader2 {...iconProps} className="w-5 h-5 animate-spin text-blue-500" />
    );
  } else if (status === "completed") {
    return <CheckCircle {...iconProps} className="w-5 h-5 text-green-500" />;
  } else if (status === "failed") {
    return <AlertCircle {...iconProps} className="w-5 h-5 text-red-500" />;
  }

  // Default icons based on step type
  switch (stepId) {
    case "initial_planning":
      return <MapPin {...iconProps} className="w-5 h-5 text-purple-500" />;
    case "destination_research":
      return <Search {...iconProps} className="w-5 h-5 text-blue-500" />;
    case "real_time_search":
      return <Globe {...iconProps} className="w-5 h-5 text-green-500" />;
    case "final_compilation":
      return <FileText {...iconProps} className="w-5 h-5 text-orange-500" />;
    default:
      return <Bot {...iconProps} className="w-5 h-5 text-gray-500" />;
  }
};

const getStepColor = (status: string) => {
  switch (status) {
    case "running":
      return "border-blue-500 bg-blue-50/50";
    case "completed":
      return "border-green-500 bg-green-50/50";
    case "failed":
      return "border-red-500 bg-red-50/50";
    case "pending":
    default:
      return "border-gray-300 bg-gray-50/50";
  }
};

export default function WorkflowProgress({
  teamName,
  taskId,
  workflowData,
  onStepComplete,
}: WorkflowProgressProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  // Initialize workflow steps based on team type
  useEffect(() => {
    const initializeSteps = () => {
      if (teamName.toLowerCase().includes("travel")) {
        return [
          {
            id: "initial_planning",
            name: "Initial Travel Planning",
            agent: "Travel Specialist",
            status: "pending" as const,
            description:
              "Creating comprehensive travel plan based on your requirements",
            icon: <MapPin className="w-5 h-5" />,
          },
          {
            id: "destination_research",
            name: "Destination Research",
            agent: "Research Assistant",
            status: "pending" as const,
            description:
              "Gathering detailed information about destinations and attractions",
            icon: <Search className="w-5 h-5" />,
          },
          {
            id: "real_time_search",
            name: "Real-time Information Search",
            agent: "Tavily Search Agent",
            status: "pending" as const,
            description:
              "Finding current information, prices, and availability",
            icon: <Globe className="w-5 h-5" />,
          },
          {
            id: "final_compilation",
            name: "Final Itinerary Compilation",
            agent: "Travel Specialist",
            status: "pending" as const,
            description:
              "Compiling all information into a comprehensive travel plan",
            icon: <FileText className="w-5 h-5" />,
          },
        ];
      }

      // Default workflow for other teams
      return [
        {
          id: "analysis",
          name: "Request Analysis",
          agent: "Lead Agent",
          status: "pending" as const,
          description: "Analyzing your request and planning approach",
          icon: <Bot className="w-5 h-5" />,
        },
        {
          id: "execution",
          name: "Task Execution",
          agent: "Specialist Agents",
          status: "pending" as const,
          description: "Executing the main task with specialized agents",
          icon: <Users className="w-5 h-5" />,
        },
        {
          id: "finalization",
          name: "Result Finalization",
          agent: "Lead Agent",
          status: "pending" as const,
          description: "Finalizing and formatting the results",
          icon: <CheckCircle className="w-5 h-5" />,
        },
      ];
    };

    setSteps(initializeSteps());
  }, [teamName]);

  // Update workflow progress based on workflowData
  useEffect(() => {
    console.log("📊 WorkflowProgress received data:", workflowData);
    console.log("📊 Has results?", workflowData?.results);
    console.log(
      "📊 Results keys:",
      workflowData?.results ? Object.keys(workflowData.results) : "none"
    );

    if (workflowData && workflowData.results) {
      const updatedSteps = steps.map((step) => {
        const stepResult = workflowData.results[step.id];
        console.log(`📊 Step ${step.id}:`, stepResult ? "HAS DATA" : "NO DATA");

        if (stepResult && step.status !== "completed") {
          return {
            ...step,
            status: "completed" as const,
            result: stepResult,
            endTime: new Date(),
          };
        }

        return step;
      });

      // Find current running step
      const completedCount = updatedSteps.filter(
        (s) => s.status === "completed"
      ).length;
      const runningStepIndex = Math.min(
        completedCount,
        updatedSteps.length - 1
      );

      // Only update running step if it's not already completed
      if (
        completedCount < updatedSteps.length &&
        updatedSteps[runningStepIndex].status !== "completed"
      ) {
        updatedSteps[runningStepIndex] = {
          ...updatedSteps[runningStepIndex],
          status: "running",
          startTime: updatedSteps[runningStepIndex].startTime || new Date(),
        };
      }

      // Only update if there are actual changes
      const hasChanges = updatedSteps.some(
        (step, index) =>
          step.status !== steps[index]?.status ||
          step.result !== steps[index]?.result
      );

      if (hasChanges) {
        setSteps(updatedSteps);
        setCurrentStepIndex(runningStepIndex);
        setOverallProgress((completedCount / updatedSteps.length) * 100);

        // Notify parent of step completion
        if (onStepComplete && completedCount > 0) {
          const lastCompletedStep = updatedSteps.find(
            (s, i) => i === completedCount - 1 && s.status === "completed"
          );
          if (lastCompletedStep && lastCompletedStep.result) {
            onStepComplete(lastCompletedStep);
          }
        }
      }
    }
  }, [workflowData]);

  const formatStepResult = (step: WorkflowStep) => {
    if (!step.result) return null;

    // Handle travel planning results
    if (step.id === "initial_planning" && step.result.plan) {
      const plan = step.result.plan;
      const agentOutput = plan.agent_output || "";
      // Extract key info from agent output
      const lines = agentOutput.split("\n").filter((l: string) => l.trim());
      const preview = lines.slice(0, 5).join("\n");

      return (
        <div className="text-sm space-y-2">
          <div className="font-semibold text-purple-600">
            Travel Plan Created
          </div>
          {plan.destination && (
            <p>
              <strong>Destination:</strong> {plan.destination}
            </p>
          )}
          {plan.duration && (
            <p>
              <strong>Duration:</strong> {plan.duration} days
            </p>
          )}
          {preview && (
            <div className="mt-2 p-3 bg-gray-800 text-gray-100 rounded text-xs max-h-32 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans">{preview}...</pre>
            </div>
          )}
        </div>
      );
    }

    if (step.id === "destination_research" && step.result.research_data) {
      const research = step.result.research_data;
      // Safely handle attractions data - ensure it's always an array
      const attractions = Array.isArray(research.attractions) 
        ? research.attractions 
        : Array.isArray(research.key_attractions)
        ? research.key_attractions
        : research.attractions?.items || research.key_attractions?.items || [];

      return (
        <div className="text-sm space-y-2">
          <div className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Key Attractions
          </div>
          <div className="space-y-2">
            {(Array.isArray(attractions) ? attractions : []).slice(0, 5).map((attraction: any, i: number) => (
              <div
                key={i}
                className="bg-gray-800 border border-blue-500/30 p-3 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="font-semibold text-gray-100 text-sm mb-1">
                  {attraction.name || attraction}
                </div>
                {attraction.rating && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium">
                      {attraction.rating}
                    </span>
                    {attraction.reviews && (
                      <span className="text-xs text-gray-500">
                        ({attraction.reviews.toLocaleString()} reviews)
                      </span>
                    )}
                  </div>
                )}
                {attraction.address && (
                  <div className="text-xs text-gray-600 mb-1">
                    {attraction.address}
                  </div>
                )}
                {attraction.category && (
                  <span className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    {attraction.category}
                  </span>
                )}
                {attraction.website && (
                  <a
                    href={attraction.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                  >
                    Visit Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (step.id === "real_time_search" && step.result.search_results) {
      const results = step.result.search_results;
      // Safely handle flights and hotels data - ensure they're always arrays
      const flights = Array.isArray(results.flights) 
        ? results.flights 
        : results.flights?.items || [];
      const hotels = Array.isArray(results.hotels) 
        ? results.hotels 
        : results.hotels?.items || [];

      return (
        <div className="text-sm space-y-3">
          {flights.length > 0 && (
            <div>
              <div className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                <Plane className="w-4 h-4" />
                Flights Found
              </div>
              <div className="space-y-2">
                {(Array.isArray(flights) ? flights : []).slice(0, 3).map((flight: any, i: number) => (
                  <div
                    key={i}
                    className="bg-gray-800 border border-green-500/30 p-3 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-white">
                          {flight.airline}
                        </div>
                        <div className="text-xs text-gray-400">
                          {flight.flight_number}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">
                          ${flight.price}
                        </div>
                        <div className="text-xs text-gray-400">
                          {flight.stops === 0
                            ? "Direct"
                            : `${flight.stops} stop(s)`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-200 mb-2">
                      <span className="font-medium">
                        {flight.departure_time}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{flight.arrival_time}</span>
                      <span className="text-gray-400">({flight.duration})</span>
                    </div>
                    <a
                      href={
                        flight.booking_url ||
                        `https://www.google.com/travel/flights?q=${encodeURIComponent(
                          `${flight.airline} ${flight.flight_number} ${
                            flight.departure_airport || ""
                          } to ${flight.arrival_airport || ""}`
                        )}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                    >
                      Book Now <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          {hotels.length > 0 && (
            <div>
              <div className="font-semibold text-orange-600 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Hotels Found
              </div>
              <div className="space-y-2">
                {(Array.isArray(hotels) ? hotels : []).slice(0, 3).map((hotel: any, i: number) => (
                  <div
                    key={i}
                    className="bg-gray-800 border border-orange-500/30 p-3 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm leading-tight">
                          {hotel.name}
                        </div>
                        {hotel.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm font-medium text-gray-200">
                              {hotel.rating}
                            </span>
                            {hotel.reviews && (
                              <span className="text-xs text-gray-400">
                                ({hotel.reviews} reviews)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-2">
                        <div className="text-lg font-bold text-orange-400">
                          {hotel.price_per_night}
                        </div>
                        {hotel.total_price &&
                          hotel.total_price !== hotel.price_per_night && (
                            <div className="text-xs text-gray-400">
                              {hotel.total_price} total
                            </div>
                          )}
                      </div>
                    </div>
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {hotel.amenities
                          .slice(0, 3)
                          .map((amenity: string, j: number) => (
                            <span
                              key={j}
                              className="text-xs bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30"
                            >
                              {amenity}
                            </span>
                          ))}
                      </div>
                    )}
                    {hotel.booking_url && (
                      <a
                        href={hotel.booking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                      >
                        View Details <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Generic result display
    if (typeof step.result === "object") {
      return (
        <div className="text-sm">
          <p>
            <strong>Status:</strong> {step.result.status || "Completed"}
          </p>
          {step.result.agent && (
            <p>
              <strong>Agent:</strong> {step.result.agent}
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Lingo Lancers Travel Agents
          </CardTitle>
          <Badge variant="outline">{teamName}</Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="w-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence>
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className={`transition-all duration-300 ${getStepColor(
                  step.status
                )}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Step Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getStepIcon(step.id, step.status)}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm text-white">
                            {step.name}
                          </h4>
                          <p className="text-xs text-gray-300">
                            Agent: {step.agent}
                          </p>
                        </div>
                        <Badge
                          variant={
                            step.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {step.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>

                      {/* Step Timing */}
                      {(step.startTime || step.endTime) && (
                        <div className="text-xs text-muted-foreground">
                          {step.startTime && (
                            <span>
                              Started: {step.startTime.toLocaleTimeString()}
                            </span>
                          )}
                          {step.endTime && (
                            <span className="ml-4">
                              Completed: {step.endTime.toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Step Result */}
                      {step.status === "completed" && step.result && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 p-3 bg-background/50 rounded-lg border"
                        >
                          {formatStepResult(step)}
                        </motion.div>
                      )}
                    </div>

                    {/* Arrow to next step */}
                    {index < steps.length - 1 && (
                      <div className="flex-shrink-0 mt-6">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Workflow Summary */}
        {overallProgress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-green-500 bg-green-50/50">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-green-700">
                  Workflow Completed!
                </h3>
                <p className="text-sm text-green-600 mt-1">
                  All agents have successfully completed their tasks
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
