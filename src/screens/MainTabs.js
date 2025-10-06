import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Image } from 'react-native';

// Import tab screens
import HomeTab from './tabs/HomeTab';
import EventsTab from './tabs/EventsTab';
import QRCodeTab from './tabs/QRCodeTab';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1B2735',
          borderTopColor: '#374151',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
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
  );
};

export default MainTabs;
