import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

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
          fontSize: 12,
          fontWeight: '600',
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
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsTab}
        options={{
          tabBarLabel: 'Eventos',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🎫</Text>
          ),
        }}
      />
      <Tab.Screen
        name="QRCode"
        component={QRCodeTab}
        options={{
          tabBarLabel: 'Código QR',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📱</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
