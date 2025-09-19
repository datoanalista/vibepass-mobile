// API Configuration for Ticketera Mobile App
const API_BASE_URL = 'https://5cc4625338a4.ngrok-free.app';

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

