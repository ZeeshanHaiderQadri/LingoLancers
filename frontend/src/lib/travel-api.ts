/**
 * Travel Plans API Service
 * Handles all travel plan CRUD operations with backend
 */

const API_BASE = process.env.NEXT_PUBLIC_LINGO_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export interface TravelPlan {
  id: string;
  user_id?: string;
  departure?: string;
  destination: string;
  start_date: string;
  end_date: string;
  adults: number;
  children: number;
  budget?: string;
  preferences?: string;
  status: string;
  task_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTravelPlanData {
  departure?: string;
  destination: string;
  start_date: string;
  end_date: string;
  adults?: number;
  children?: number;
  budget?: string;
  preferences?: string;
  status?: string;
  task_id?: string;
}

export interface UpdateTravelPlanData {
  departure?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  adults?: number;
  children?: number;
  budget?: string;
  preferences?: string;
  status?: string;
  task_id?: string;
}

class TravelAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE}/api/travel`;
  }

  async createTravelPlan(planData: CreateTravelPlanData): Promise<{ success: boolean; data?: TravelPlan; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Failed to create travel plan');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Create travel plan error:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllTravelPlans(userId: string = 'default_user'): Promise<{ success: boolean; data?: TravelPlan[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/plans?user_id=${userId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Failed to fetch travel plans');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Get travel plans error:', error);
      return { success: false, error: error.message };
    }
  }

  async getTravelPlan(planId: string): Promise<{ success: boolean; data?: TravelPlan; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/plans/${planId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Failed to fetch travel plan');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Get travel plan error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateTravelPlan(planId: string, updates: UpdateTravelPlanData): Promise<{ success: boolean; data?: TravelPlan; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Failed to update travel plan');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Update travel plan error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteTravelPlan(planId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/plans/${planId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Failed to delete travel plan');
      }

      return { success: true };
    } catch (error: any) {
      console.error('Delete travel plan error:', error);
      return { success: false, error: error.message };
    }
  }

  async getPlansByStatus(status: string, userId: string = 'default_user'): Promise<{ success: boolean; data?: TravelPlan[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/plans/status/${status}?user_id=${userId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Failed to fetch travel plans by status');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Get plans by status error:', error);
      return { success: false, error: error.message };
    }
  }

  async healthCheck(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Health check failed');
      }

      return { success: true };
    } catch (error: any) {
      console.error('Health check error:', error);
      return { success: false, error: error.message };
    }
  }
}

export const travelAPI = new TravelAPI();