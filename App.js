import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

// Import context
import { QRProvider } from './src/context/QRContext';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import MainTabs from './src/screens/MainTabs';
import EventDetailScreen from './src/screens/EventDetailScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import ValidationMenuScreen from './src/screens/ValidationMenuScreen';
import TicketValidationScreen from './src/screens/TicketValidationScreen';
import FoodValidationScreen from './src/screens/FoodValidationScreen';
import DrinkValidationScreen from './src/screens/DrinkValidationScreen';
import ActivityValidationScreen from './src/screens/ActivityValidationScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <QRProvider>
      <NavigationContainer
        independent={false}
        onStateChange={() => {
          // Force layout recalculation to maintain tab position
          console.log('Navigation state changed - maintaining tab position');
        }}
      >
        <StatusBar style="light" backgroundColor="#1B2735" />
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false, // Hide header for all screens
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{
              title: 'Iniciar Sesión',
            }}
          />
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs}
            options={{
              title: 'App Principal',
            }}
          />
          <Stack.Screen 
            name="EventDetail" 
            component={EventDetailScreen}
            options={{
              title: 'Detalle del Evento',
            }}
          />
          <Stack.Screen 
            name="QRScanner" 
            component={QRScannerScreen}
            options={{
              title: 'Escáner QR',
            }}
          />
          <Stack.Screen 
            name="ValidationMenu" 
            component={ValidationMenuScreen}
            options={{
              title: 'Menú de Validación',
            }}
          />
          <Stack.Screen 
            name="TicketValidation" 
            component={TicketValidationScreen}
            options={{
              title: 'Validación de Entradas',
            }}
          />
          <Stack.Screen 
            name="FoodValidation" 
            component={FoodValidationScreen}
            options={{
              title: 'Validación de Alimentos',
            }}
          />
          <Stack.Screen 
            name="DrinkValidation" 
            component={DrinkValidationScreen}
            options={{
              title: 'Validación de Bebestibles',
            }}
          />
          <Stack.Screen 
            name="ActivityValidation" 
            component={ActivityValidationScreen}
            options={{
              title: 'Validación de Actividades',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </QRProvider>
  );
}
