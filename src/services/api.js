// API Configuration for Ticketera Mobile App
import StorageService from './storage';

const API_BASE_URL = 'https://21c19232e6a4.ngrok-free.app';

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
        console.error('❌ No authentication token available');
        throw new Error('No authentication token available');
      }
      
      // Get selected event ID
      const selectedEventId = await StorageService.getSelectedEvent();
      
      if (!selectedEventId) {
        console.error('❌ No event selected');
        throw new Error('No hay evento seleccionado. Por favor seleccione un evento primero.');
      }
      
      console.log('🔐 Token exists, length:', token.length);
      console.log('🔐 Token preview:', token.substring(0, 20) + '...');
      console.log('🎪 Selected event ID:', selectedEventId);
      
      // Get user data to verify validator info
      const userData = await StorageService.getUserData();
      console.log('👤 Current validator info:', {
        id: userData?.validator?.id,
        nombre: userData?.validator?.nombre,
        eventosCount: userData?.eventos?.length || 0,
        eventoIds: userData?.eventos?.map(e => e.id) || [],
        selectedEventId: selectedEventId
      });
      
      // Log detailed event info for debugging
      if (userData?.eventos && userData.eventos.length > 0) {
        userData.eventos.forEach((evento, index) => {
          console.log(`🎪 Evento ${index + 1} del validador:`, {
            id: evento.id,
            nombre: evento.informacionGeneral?.nombreEvento,
            fecha: evento.informacionGeneral?.fechaEvento,
            lugar: evento.informacionGeneral?.lugarEvento,
            estado: evento.informacionGeneral?.estado,
            isSelected: evento.id === selectedEventId
          });
        });
      }
      
      // Use the correct redemptions endpoint
      const endpoint = `/api/redemptions/sale/${saleNumber}`;
      const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
      console.log('🔍 Using endpoint:', endpoint);
      console.log('🔍 Full URL:', fullUrl);
      
      const response = await this.fetchWithTimeout(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
          'X-Evento-Id': selectedEventId, // ← NUEVO HEADER REQUERIDO
        },
      });

      console.log('📡 Sale details response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📦 Sale details data:', data);

      if (response.ok) {
        if (data.status === 'success' && data.data) {
          console.log('✅ Sale details retrieved successfully');
          return {
            success: true,
            data: data.data,
            message: data.message || 'Sale details retrieved successfully'
          };
        } else {
          console.error('❌ Invalid response format:', data);
          throw new Error(data.message || 'Failed to get sale details - Invalid response format');
        }
      } else {
        console.error('❌ HTTP Error:', response.status, data);
        
        // Handle specific error cases
        if (response.status === 401) {
          console.error('🔐 Authentication failed - Token may be invalid or expired');
          
          // Check if it's a validator permission issue
          if (data.message && data.message.includes('Token inválido para este evento')) {
            console.error('🚫 Validator permission issue - This validator may not have access to this specific event');
            
            // Don't clear user data for permission issues, just show error
            throw new Error('No tiene permisos para validar este evento. Verifique que el validador esté asignado al evento correcto.');
          } else {
            // Clear stored token if it's truly invalid
            await StorageService.clearUserData();
            throw new Error('Token inválido. Por favor inicie sesión nuevamente.');
          }
        } else if (response.status === 403) {
          throw new Error('No tiene permisos para acceder a este evento');
        } else if (response.status === 404) {
          throw new Error('Venta no encontrada');
        } else {
          throw new Error(data.message || `HTTP Error ${response.status}`);
        }
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

      // Get selected event ID
      const selectedEventId = await StorageService.getSelectedEvent();
      if (!selectedEventId) {
        throw new Error('No hay evento seleccionado. Por favor seleccione un evento primero.');
      }

      console.log('🎪 Using selected event ID for check-in:', selectedEventId);

      const response = await this.fetchWithTimeout(`${API_CONFIG.BASE_URL}/api/redemptions/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
          'X-Evento-Id': selectedEventId, // ← NUEVO HEADER REQUERIDO
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

      // Get selected event ID
      const selectedEventId = await StorageService.getSelectedEvent();
      if (!selectedEventId) {
        throw new Error('No hay evento seleccionado. Por favor seleccione un evento primero.');
      }

      console.log('🎪 Using selected event ID for product redemption:', selectedEventId);

      const response = await this.fetchWithTimeout(`${API_CONFIG.BASE_URL}/api/redemptions/redeem-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
          'X-Evento-Id': selectedEventId, // ← NUEVO HEADER REQUERIDO
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

      // Get selected event ID
      const selectedEventId = await StorageService.getSelectedEvent();
      if (!selectedEventId) {
        throw new Error('No hay evento seleccionado. Por favor seleccione un evento primero.');
      }

      console.log('🎪 Using selected event ID for activity redemption:', selectedEventId);

      const response = await this.fetchWithTimeout(`${API_CONFIG.BASE_URL}/api/redemptions/redeem-activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
          'X-Evento-Id': selectedEventId, // ← NUEVO HEADER REQUERIDO
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

  // Verify token validity (simplified version)
  async verifyToken() {
    try {
      const token = await StorageService.getToken();
      if (!token) {
        return { valid: false, error: 'No token available' };
      }

      // Just check if token exists and has proper format
      // Don't make API calls to avoid token expiration issues
      if (token.length > 50 && token.includes('.')) {
        return { valid: true };
      } else {
        return { valid: false, error: 'Invalid token format' };
      }
    } catch (error) {
      console.error('❌ Token verification error:', error);
      return { valid: false, error: error.message };
    }
  }

  // Get validator events
  async getValidatorEvents() {
    try {
      console.log('🎫 Fetching validator events');
      
      const token = await StorageService.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await this.fetchWithTimeout(`${API_CONFIG.BASE_URL}/api/users/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Validator events response status:', response.status);
      const data = await response.json();
      console.log('📦 Validator events data:', data);

      if (response.ok) {
        if (data.status === 'success' && data.data) {
          return {
            success: true,
            data: data.data,
            message: data.message || 'Events retrieved successfully'
          };
        } else {
          throw new Error(data.message || 'Failed to get validator events');
        }
      } else {
        throw new Error(data.message || `HTTP Error ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Validator events error:', error);
      throw new Error(error.message || 'Failed to get validator events');
    }
  }

  // Login method
  async login(email, password) {
    try {
      console.log('🚀 Attempting login with URL:', API_CONFIG.ENDPOINTS.AUTH_LOGIN);
      console.log('📦 Data being sent:', { correoElectronico: email, password: '***' });

      const response = await this.fetchWithTimeout(API_CONFIG.ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ correoElectronico: email, password }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('📦 Response data:', data);
      } else {
        // If not JSON, it's likely an HTML error page from ngrok
        const htmlText = await response.text();
        console.log('📦 Response (HTML):', htmlText.substring(0, 200) + '...');
        throw new Error('Server returned HTML instead of JSON. Check ngrok configuration.');
      }

      if (response.ok) {
        // Handle validator login response structure with new format
        if (data.status === 'success' && data.data) {
          return {
            success: true,
            data: {
              validator: data.data.validator,
              eventos: data.data.eventos,
              permisos: data.data.permisos,
              totalEventos: data.data.totalEventos
            },
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

