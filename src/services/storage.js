import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  REMEMBER_ME: 'rememberMe',
};

class StorageService {
  // Save user token
  async saveToken(token) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      console.log('✅ Token saved successfully');
    } catch (error) {
      console.error('❌ Error saving token:', error);
      throw error;
    }
  }

  // Get user token
  async getToken() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      console.log('📱 Token retrieved:', token ? 'Token exists' : 'No token found');
      return token;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  }

  // Save user data
  async saveUserData(userData) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      console.log('✅ User data saved successfully');
    } catch (error) {
      console.error('❌ Error saving user data:', error);
      throw error;
    }
  }

  // Get user data
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        const parsedData = JSON.parse(userData);
        console.log('📱 User data retrieved:', parsedData.nombreCompleto || 'Unknown user');
        return parsedData;
      }
      console.log('📱 No user data found');
      return null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  }

  // Save remember me preference
  async saveRememberMe(remember) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, remember.toString());
      console.log('✅ Remember me preference saved:', remember);
    } catch (error) {
      console.error('❌ Error saving remember me preference:', error);
      throw error;
    }
  }

  // Get remember me preference
  async getRememberMe() {
    try {
      const remember = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
      return remember === 'true';
    } catch (error) {
      console.error('❌ Error getting remember me preference:', error);
      return false;
    }
  }

  // Clear all user data (logout)
  async clearUserData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      console.log('✅ User data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing user data:', error);
      throw error;
    }
  }

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const token = await this.getToken();
      const userData = await this.getUserData();
      const isLoggedIn = !!(token && userData);
      console.log('🔐 User logged in status:', isLoggedIn);
      return isLoggedIn;
    } catch (error) {
      console.error('❌ Error checking login status:', error);
      return false;
    }
  }
}

export default new StorageService();
export { STORAGE_KEYS };

