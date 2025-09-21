// API Configuration for Ticketera Mobile App
import StorageService from './storage';

const API_BASE_URL = 'https://48a011d134ed.ngrok-free.app';

const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    AUTH_LOGIN: `${API_BASE_URL}/api/users/login`,
  },
  REQUEST_CONFIG: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    timeout: 10000,
  },
};

// API Service Class
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = API_CONFIG.REQUEST_CONFIG.headers;
    this.timeout = API_CONFIG.REQUEST_CONFIG.timeout;
  }

  // Generic fetch with timeout and error handling
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Please check your internet connection');
      }
      throw error;
    }
  }

  // Get redemption details by saleNumber (for QR scan validation)
  async getSaleDetails(saleNumber) {
    try {
      console.log('🔍 Fetching sale details for:', saleNumber);
      
      // Get the stored token for authentication
      const token = await StorageService.getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Use the correct redemptions endpoint
      const endpoint = `/api/redemptions/sale/${saleNumber}`;
      console.log('🔍 Using endpoint:', endpoint);
      console.log('🔐 Using token for authentication');
      
      const response = await this.fetchWithTimeout(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Sale details response status:', response.status);

      const data = await response.json();
      console.log('📦 Sale details data:', data);

      if (response.ok) {
        if (data.status === 'success' && data.data) {
          return {
            success: true,
            data: data.data,
            message: data.message || 'Sale details retrieved successfully'
          };
        } else {
          throw new Error(data.message || 'Failed to get sale details');
        }
      } else {
        throw new Error(data.message || `HTTP Error ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Sale details error:', error);
      
      if (error.message.includes('timeout')) {
        throw new Error('Connection timeout - Please check your internet connection');
      } else if (error.message.includes('Network')) {
        throw new Error('Network error - Please check your internet connection');
      } else {
        throw new Error(error.message || 'Failed to get sale details');
      }
    }
  }

  // Check-in attendees
  async checkInAttendees(saleNumber, attendeeIndexes) {
    try {
      console.log('🎫 Checking in attendees:', { saleNumber, attendeeIndexes });
      
      const token = await StorageService.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await this.fetchWithTimeout(`${API_CONFIG.BASE_URL}/api/redemptions/checkin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          saleNumber,
          attendeeIndexes
        }),
      });

      console.log('📡 Check-in response status:', response.status);
      const data = await response.json();
      console.log('📦 Check-in response data:', data);

      if (response.ok) {
        if (data.status === 'success') {
          return {
            success: true,
            data: data.data,
            message: data.message || 'Check-in successful'
          };
        } else {
          throw new Error(data.message || 'Check-in failed');
        }
      } else {
        throw new Error(data.message || `HTTP Error ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Check-in error:', error);
      throw new Error(error.message || 'Check-in failed');
    }
  }

  // Redeem products (food and drinks)
  async redeemProducts(saleNumber, redemptions) {
    try {
      console.log('🍽️ Redeeming products:', { saleNumber, redemptions });
      
      const token = await StorageService.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await this.fetchWithTimeout(`${API_CONFIG.BASE_URL}/api/redemptions/redeem-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          saleNumber,
          redemptions
        }),
      });

      console.log('📡 Products redemption response status:', response.status);
      const data = await response.json();
      console.log('📦 Products redemption response data:', data);

      if (response.ok) {
        if (data.status === 'success') {
          return {
            success: true,
            data: data.data,
            message: data.message || 'Products redeemed successfully'
          };
        } else {
          throw new Error(data.message || 'Products redemption failed');
        }
      } else {
        throw new Error(data.message || `HTTP Error ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Products redemption error:', error);
      throw new Error(error.message || 'Products redemption failed');
    }
  }

  // Redeem activities
  async redeemActivities(saleNumber, redemptions) {
    try {
      console.log('🎯 Redeeming activities:', { saleNumber, redemptions });
      
      const token = await StorageService.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await this.fetchWithTimeout(`${API_CONFIG.BASE_URL}/api/redemptions/redeem-activities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          saleNumber,
          redemptions
        }),
      });

      console.log('📡 Activities redemption response status:', response.status);
      const data = await response.json();
      console.log('📦 Activities redemption response data:', data);

      if (response.ok) {
        if (data.status === 'success') {
          return {
            success: true,
            data: data.data,
            message: data.message || 'Activities redeemed successfully'
          };
        } else {
          throw new Error(data.message || 'Activities redemption failed');
        }
      } else {
        throw new Error(data.message || `HTTP Error ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Activities redemption error:', error);
      throw new Error(error.message || 'Activities redemption failed');
    }
  }

  // Login method
  async login(email, password) {
    try {
      console.log('🚀 Attempting login with URL:', API_CONFIG.ENDPOINTS.AUTH_LOGIN);
      console.log('📦 Data being sent:', { correoElectronico: email, password: '***' });

      const response = await this.fetchWithTimeout(API_CONFIG.ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        body: JSON.stringify({ correoElectronico: email, password }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok) {
        // Handle validator login response structure
        if (data.status === 'success' && data.data) {
          return {
            success: true,
            data: data.data,
            token: data.data.token,
            message: data.message || 'Login successful'
          };
        } else {
          throw new Error(data.message || 'Login failed - Invalid response format');
        }
      } else {
        throw new Error(data.message || `HTTP Error ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (error.message.includes('timeout')) {
        throw new Error('Connection timeout - Please check your internet connection');
      } else if (error.message.includes('Network')) {
        throw new Error('Network error - Please check your internet connection');
      } else {
        throw new Error(error.message || 'Login failed - Please try again');
      }
    }
  }
}

export default new ApiService();
export { API_CONFIG };

