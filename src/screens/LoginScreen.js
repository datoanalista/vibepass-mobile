import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import ApiService from '../services/api';
import StorageService from '../services/storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const isLoggedIn = await StorageService.isLoggedIn();
      if (isLoggedIn) {
        console.log('✅ User already logged in, navigating to MainTabs');
        navigation.replace('MainTabs');
      }
    } catch (error) {
      console.error('❌ Error checking login status:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Por favor ingrese email y contraseña',
        visibilityTime: 3000,
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Starting login process...');
      
      const result = await ApiService.login(email, password);
      
      if (result.success) {
        console.log('✅ Login successful:', result.data);
        console.log('🔐 Token received:', result.token ? 'Token exists' : 'No token');
        
        // Save user data and token
        if (result.token) {
          console.log('💾 Saving token...');
          await StorageService.saveToken(result.token);
          console.log('✅ Token saved successfully');
        } else {
          console.error('❌ No token received from login response');
        }
        
        if (result.data) {
          console.log('💾 Saving user data...');
          await StorageService.saveUserData(result.data);
          console.log('✅ User data saved successfully');
        }
        
        await StorageService.saveRememberMe(rememberMe);
        
        // Verify token was saved
        const savedToken = await StorageService.getToken();
        console.log('🔍 Token verification after save:', savedToken ? 'Token exists in storage' : 'No token in storage');
        
        // Check if validator has multiple events
        const eventos = result.data.eventos || [];
        console.log('🎪 Events available for validator:', eventos.length);
        
        if (eventos.length === 0) {
          console.log('❌ No events assigned to validator');
          Toast.show({
            type: 'error',
            text1: 'Sin eventos asignados',
            text2: 'No hay eventos asignados a este validador.',
            visibilityTime: 5000,
          });
          return;
        } else if (eventos.length === 1) {
          // Auto-select the only event
          const eventoId = eventos[0].id;
          console.log('🎪 Auto-selecting single event:', eventoId);
          await StorageService.saveSelectedEvent(eventoId);
          navigation.replace('MainTabs');
        } else {
          // Multiple events - need to show selection screen
          console.log('🎪 Multiple events available, showing selection screen');
          navigation.replace('EventSelection', { eventos });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error de Conexión',
          text2: 'En estos momentos no se puede acceder al sistema, por favor inténtalo más tarde.',
          visibilityTime: 5000,
        });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error de Conexión',
        text2: 'En estos momentos no se puede acceder al sistema, por favor inténtalo más tarde.',
        visibilityTime: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1B2735" />
      
      {/* Welcome Image - Top Section */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/login_image.png')}
          style={styles.welcomeImage}
          resizeMode="cover"
        />
      </View>

      {/* Form Section - Bottom */}
      <KeyboardAvoidingView 
        style={styles.formSection}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Image
                  source={require('../../assets/icon_user.png')}
                  style={styles.inputIcon}
                  resizeMode="contain"
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Ingresa tu email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Clave</Text>
              <View style={styles.inputWrapper}>
                <Image
                  source={require('../../assets/icon_pass.png')}
                  style={styles.inputIcon}
                  resizeMode="contain"
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Ingresa tu clave"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={['#01A8E2', '#99B7DB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Ingresar</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    flex: 0.55,
    position: 'relative',
    zIndex: 1,
  },
  welcomeImage: {
    width: '100%',
    height: '100%',
  },
  formSection: {
    flex: 0.45,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    zIndex: 0,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 0,
    color: '#1B2735',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.9,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B8B8B8',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: '#9CA3AF',
  },
  input: {
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 14,
    letterSpacing: 0,
    color: '#1B2735',
    padding: 0,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    color: '#9CA3AF',
  },
  loginButton: {
    width: width * 0.9,
    alignSelf: 'center',
    height: 59,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  gradientButton: {
    flex: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default LoginScreen;

