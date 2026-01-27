'use client';

import { API_BASE_URL } from '@/utils/constants';

interface ApiResponse<T = any> {
  user?: { _id: string; username: string; name: string; role: string; } | undefined;
  success: boolean;
  message?: string;
  data?: T;
  token?: string; // Added token field for login responses
  error?: string;
}

class ApiService {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    console.log('ApiService initialized with baseUrl:', this.baseUrl);
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    console.log('ApiService: Headers prepared', headers);

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      // Try to parse the response as JSON, but handle cases where it's not JSON
      let errorData: any = {};
      try {
        errorData = await response.json();
        console.error('API Error Response (JSON):', errorData, 'Status:', response.status);
      } catch (parseError) {
        // If the response is not JSON, try to get text or use status message
        try {
          const errorText = await response.text();
          console.error('Non-JSON API Error Response:', errorText, 'Status:', response.status);
          errorData = { message: errorText || `HTTP error! status: ${response.status}` };
        } catch (textError) {
          console.error('Could not parse error response:', textError);
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
      }
      
      return {
        success: false,
        user: undefined,
        error: errorData.message || errorData.error || `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log('API Success Response:', data);
    // The backend returns the response directly with success, user, token at the root level
    // So we return it as is, since it already matches our ApiResponse structure
    return data;
  }

  public setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  public removeToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  public getToken(): string | null {
    return this.token;
  }

  // Authentication endpoints
  public async login(username: string, password: string): Promise<ApiResponse<{ user: { _id: string; username: string; name: string; role: string }; token: string }>> {
    console.log('ApiService: Sending login request', { username, url: `${this.baseUrl}/auth/login` });
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      console.log('ApiService: Login response received', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      
      const result: ApiResponse<{ user: { _id: string; username: string; name: string; role: string }; token: string }> = await this.handleResponse(response);
      console.log('ApiService: Login response processed', { success: result.success, result });
      
      return result;
    } catch (error: any) {
      // Better error logging to capture network errors
      console.error('ApiService: Login error caught', {
        error,
        errorMessage: error?.message,
        errorStack: error?.stack,
        errorToString: error?.toString ? error.toString() : 'no toString',
        errorType: typeof error,
        rawError: JSON.stringify(error, Object.getOwnPropertyNames(error)) // This captures all properties
      });
      
      return {
        success: false,
        user: undefined,
        error: error?.message || (typeof error === 'string' ? error : 'Network error occurred'),
      };
    }
  }

  public async signup(username: string, password: string, name: string, role?: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/signup`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ username, password, name, role }),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getMe(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getUsers(role?: string): Promise<ApiResponse> {
    try {
      let url = `${this.baseUrl}/auth/users`;
      if (role) {
        url += `?role=${encodeURIComponent(role)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getUsersByRole(role: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/users?role=${role}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getCurrentUser(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  // User management endpoints (admin only)
  public async createUser(userData: { username: string; name: string; password: string; role: string }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async listUsers(role?: string): Promise<ApiResponse> {
    try {
      let url = `${this.baseUrl}/admin/users`;
      if (role) {
        url += `?role=${encodeURIComponent(role)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async listUsersWithPasswords(secretKey: string): Promise<ApiResponse> {
    console.warn('Password display functionality has been removed for security reasons');
    return {
      success: false,
      user: undefined,
      error: 'Password display functionality has been removed for security reasons',
    };
  }

  public async getUserById(userId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/${userId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async updateUser(userId: string, userData: { name?: string; username?: string; password?: string; role?: string; isActive?: boolean }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/${userId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async deleteUser(userId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async createSlum(data: any): Promise<ApiResponse> {
    console.log('ApiService: Sending create slum request', { data, url: `${this.baseUrl}/surveys/slums` });
    try {
      const response = await fetch(`${this.baseUrl}/surveys/slums`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      
      console.log('ApiService: Create slum response received', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      console.error('ApiService: Create slum error caught', {
        error,
        errorMessage: error?.message,
        errorStack: error?.stack,
        errorToString: error?.toString ? error.toString() : 'no toString',
        errorType: typeof error,
        rawError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async updateSlum(id: string, data: any): Promise<ApiResponse> {
    console.log('ApiService: Sending update slum request', { id, data, url: `${this.baseUrl}/surveys/slums/${id}` });
    try {
      const response = await fetch(`${this.baseUrl}/surveys/slums/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      
      console.log('ApiService: Update slum response received', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      console.error('ApiService: Update slum error caught', {
        error,
        errorMessage: error?.message,
        errorStack: error?.stack,
        errorToString: error?.toString ? error.toString() : 'no toString',
        errorType: typeof error,
        rawError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async deleteSlum(id: string): Promise<ApiResponse> {
    console.log('ApiService: Sending delete slum request', { id, url: `${this.baseUrl}/surveys/slums/${id}` });
    try {
      const response = await fetch(`${this.baseUrl}/surveys/slums/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      console.log('ApiService: Delete slum response received', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      console.error('ApiService: Delete slum error caught', {
        error,
        errorMessage: error?.message,
        errorStack: error?.stack,
        errorToString: error?.toString ? error.toString() : 'no toString',
        errorType: typeof error,
        rawError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getSlumSurvey(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/slum/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getAllSlums(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/slums`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  // State management endpoints
  public async getStates(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/states`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getDistricts(stateId?: string): Promise<ApiResponse> {
    try {
      let url = `${this.baseUrl}/admin/districts`;
      if (stateId) {
        url += `?stateId=${encodeURIComponent(stateId)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getDistrictsByState(stateId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/districts/state/${stateId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getAllSlumSurveys(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/slum-survey`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  // Household survey endpoints
  public async createHouseholdSurvey(data: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/household`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getHouseholdSurvey(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/household/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async updateHouseholdSurvey(id: string, data: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/household/${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getHouseholdSurveysBySlum(slumId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/households/${slumId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  // Assignment endpoints
  public async assignSlumToSurveyor(surveyorId: string, slumId: string): Promise<ApiResponse> {
    try {
      console.log('assignSlumToSurveyor called with:', { surveyorId, slumId });
      const url = `${this.baseUrl}/surveys/assignments/assign-slum`;
      const body = JSON.stringify({ 
        surveyorId, 
        slumId,
        assignmentType: 'FULL_SLUM'  // Default assignment type for simple slum assignment
      });
      console.log('Request URL:', url);
      console.log('Request Body:', body);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: body,
      });

      console.log('Response Status:', response.status, 'OK:', response.ok);
      const result = await this.handleResponse(response);
      console.log('assignSlumToSurveyor Result:', result);
      
      return result;
    } catch (error: any) {
      console.error('assignSlumToSurveyor Network Error:', error);
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getAssignedSlums(): Promise<ApiResponse> {
    try {
      console.log('Making request to:', `${this.baseUrl}/surveys/assignments/my-assigned-slums`);
      const response = await fetch(`${this.baseUrl}/surveys/assignments/my-assigned-slums`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      console.log('Response status:', response.status, 'Response OK:', response.ok);
      
      return await this.handleResponse(response);
    } catch (error: any) {
      console.error('getAssignedSlums error:', error);
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getMyAssignments(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/assignments/my-assigned-slums`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getSurveyorAssignments(userId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/assignments/surveyor/${userId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getAllAssignments(): Promise<ApiResponse> {
    try {
      console.log('Fetching all assignments from:', `${this.baseUrl}/surveys/assignments`);
      const response = await fetch(`${this.baseUrl}/surveys/assignments`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      console.log('getAllAssignments response status:', response.status);
      return await this.handleResponse(response);
    } catch (error: any) {
      console.error('getAllAssignments error:', error);
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getAssignment(assignmentId: string): Promise<ApiResponse> {
    try {
      console.log('Fetching assignment from:', `${this.baseUrl}/surveys/assignments/${assignmentId}`);
      const response = await fetch(`${this.baseUrl}/surveys/assignments/${assignmentId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      console.log('getAssignment response status:', response.status);
      return await this.handleResponse(response);
    } catch (error: any) {
      console.error('getAssignment error:', error);
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async updateAssignment(assignmentId: string, assignmentData: { status?: string; assignmentType?: string; surveyor?: string; slum?: string }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(assignmentData),
      });
      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async deleteAssignment(assignmentId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  // Export endpoints
  public async exportSlumSurveys(): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/export/slum-surveys`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error: any) {
      throw new Error(error.message || 'Network error occurred during export');
    }
  }

  public async exportHouseholdSurveys(slumId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/export/household-surveys/${slumId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error: any) {
      throw new Error(error.message || 'Network error occurred during export');
    }
  }

  // Generic GET method for custom endpoints
  public async get(endpoint: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  // Generic POST method for custom endpoints
  public async post(endpoint: string, data: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  // Generic PUT method for custom endpoints
  public async put(endpoint: string, data?: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getSlums(): Promise<ApiResponse> {
    return this.getAllSlums();
  }

  // Additional survey methods
  public async getSlum(slumId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/slums/${slumId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async getHousehold(householdId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/households/${householdId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async createOrGetSlumSurvey(slumId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/slum-surveys/${slumId}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({}),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async submitSlumSurvey(surveyId: string, data: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/slum-surveys/${surveyId}/submit`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }

  public async submitHouseholdSurvey(householdId: string, data: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/household/${householdId}/submit`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        success: false,
        user: undefined,
        error: error.message || 'Network error occurred',
      };
    }
  }
  
  // Health check method to test backend connectivity
  public async checkHealth(): Promise<ApiResponse> {
    try {
      console.log('ApiService: Checking health at', `${this.baseUrl}/..`);
      const response = await fetch(`${this.baseUrl.replace('/api', '')}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      console.log('ApiService: Health check response', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Health check error response:', errorData);
        return {
          success: false,
          error: errorData || `HTTP error! status: ${response.status}`,
        };
      }
      
      const data = await response.json();
      console.log('Health check success:', data);
      return {
        success: true,
        message: data.message,
        data,
      };
    } catch (error: any) {
      console.error('Health check failed:', error);
      return {
        success: false,
        error: error.message || 'Health check failed',
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;