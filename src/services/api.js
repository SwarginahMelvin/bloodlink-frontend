// API Service Layer for BloodLink Frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Helper method to make HTTP requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  async logout() {
    await this.request('/auth/logout', {
      method: 'POST',
    });
    
    this.token = null;
    localStorage.removeItem('authToken');
  }

  async forgotPassword(email) {
    return await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return await this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // User methods
  async getProfile() {
    return await this.request('/users/profile');
  }

  async updateProfile(profileData) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return await this.request('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Donor methods
  async registerAsDonor(donorData) {
    return await this.request('/donors/register', {
      method: 'POST',
      body: JSON.stringify(donorData),
    });
  }

  async searchDonors(searchParams) {
    const queryString = new URLSearchParams(searchParams).toString();
    return await this.request(`/donors/search?${queryString}`);
  }

  async getDonorById(donorId) {
    return await this.request(`/donors/${donorId}`);
  }

  async updateDonorAvailability(availability) {
    return await this.request('/donors/availability', {
      method: 'PUT',
      body: JSON.stringify({ isAvailable: availability }),
    });
  }

  async getDonorHistory() {
    return await this.request('/donors/history');
  }

  // Blood Request methods
  async createBloodRequest(requestData) {
    return await this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getBloodRequests(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return await this.request(`/requests?${queryString}`);
  }

  async getBloodRequestById(requestId) {
    return await this.request(`/requests/${requestId}`);
  }

  async updateBloodRequest(requestId, updateData) {
    return await this.request(`/requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteBloodRequest(requestId) {
    return await this.request(`/requests/${requestId}`, {
      method: 'DELETE',
    });
  }

  async respondToBloodRequest(requestId, response) {
    return await this.request(`/requests/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify(response),
    });
  }

  // Donation methods
  async scheduleDonation(donationData) {
    return await this.request('/donations/schedule', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  async getDonations(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return await this.request(`/donations?${queryString}`);
  }

  async updateDonationStatus(donationId, status, notes = '') {
    return await this.request(`/donations/${donationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async completeDonation(donationId, completionData) {
    return await this.request(`/donations/${donationId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(completionData),
    });
  }

  // Admin methods
  async getAdminStats() {
    return await this.request('/admin/stats');
  }

  async getAllUsers(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return await this.request(`/admin/users?${queryString}`);
  }

  async verifyDonor(donorId) {
    return await this.request(`/admin/donors/${donorId}/verify`, {
      method: 'PUT',
    });
  }

  async verifyDonation(donationId, verificationData) {
    return await this.request(`/admin/donations/${donationId}/verify`, {
      method: 'PUT',
      body: JSON.stringify(verificationData),
    });
  }

  // Dashboard-specific methods
  async getDashboardData() {
    try {
      const [requests, donations, userRequests, profile] = await Promise.allSettled([
        this.getBloodRequests(),
        this.getDonationHistory(),
        this.getUserRequests(),
        this.getProfile()
      ]);

      return {
        requests: requests.status === 'fulfilled' ? requests.value : { data: { requests: [] } },
        donations: donations.status === 'fulfilled' ? donations.value : { data: { donations: [] } },
        userRequests: userRequests.status === 'fulfilled' ? userRequests.value : { data: { requests: [] } },
        profile: profile.status === 'fulfilled' ? profile.value : { data: { user: null } }
      };
    } catch (error) {
      console.error('Dashboard data fetch failed:', error);
      throw error;
    }
  }

  async getDonationHistory() {
    return await this.request('/users/donations');
  }

  async getUserRequests() {
    return await this.request('/users/requests');
  }

  async getBloodTypeStats() {
    return await this.request('/stats/blood-types');
  }

  async getEmergencyRequests() {
    return await this.request('/requests?urgency=emergency');
  }

  // Utility methods
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Set token manually (useful for token refresh)
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Get current token
  getToken() {
    return this.token;
  }

  // Clear token
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export the class as well for testing purposes
export { ApiService };
