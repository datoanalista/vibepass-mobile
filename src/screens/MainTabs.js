import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Image, Platform, AppState, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import tab screens
import HomeTab from './tabs/HomeTab';
import EventsTab from './tabs/EventsTab';
import QRCodeTab from './tabs/QRCodeTab';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const [appState, setAppState] = useState(AppState.currentState);
  
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => subscription?.remove();
  }, []);

  // Force consistent tab bar style regardless of app state
  const getTabBarStyle = () => {
    const baseHeight = 70;
    const bottomInset = Math.max(insets.bottom, 0); // Ensure non-negative
    
    return {
      backgroundColor: '#1B2735',
      borderTopColor: '#374151',
      borderTopWidth: 1,
      height: baseHeight + bottomInset,
      paddingBottom: bottomInset || 10,
      paddingTop: 10,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      elevation: 8, // Android shadow
      shadowColor: '#000', // iOS shadow
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      // Additional properties to prevent layout shifts
      transform: [{ translateY: 0 }],
      opacity: 1,
    };
  };
  
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: getTabBarStyle(),
          tabBarActiveTintColor: '#2E7CE4',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarLabelStyle: {
            fontFamily: 'Inter',
            fontSize: 13,
            fontWeight: '400',
            lineHeight: 13,
            letterSpacing: 0,
            color: '#FFFFFF',
            marginTop: 4,
          },
          tabBarHideOnKeyboard: true,
          tabBarBackground: () => null, // Remove default background
          lazy: false, // Prevent lazy loading that might cause layout issues
          tabBarVisibilityAnimationConfig: {
            show: { animation: 'timing', config: { duration: 0 } },
            hide: { animation: 'timing', config: { duration: 0 } },
          },
          tabBarShowLabel: true,
          tabBarIconStyle: {
            marginBottom: 0,
          },
        }}
      >
      <Tab.Screen
        name="Home"
        component={HomeTab}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../assets/TAB_home.png')}
              style={{
                width: size,
                height: size,
                tintColor: color,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsTab}
        options={{
          tabBarLabel: 'Eventos',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../assets/TAB_eventos.png')}
              style={{
                width: size,
                height: size,
                tintColor: color,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="QRCode"
        component={QRCodeTab}
        options={{
          tabBarLabel: 'Código QR',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../assets/TAB_codigo_qr.png')}
              style={{
                width: size,
                height: size,
                tintColor: color,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      </Tab.Navigator>
    </View>
  );
};

export default MainTabs;
