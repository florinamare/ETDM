import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../constants/theme';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ARViewScreen from '../screens/ARViewScreen';
import MapScreen from '../screens/MapScreen';
import DiscoveredScreen from '../screens/DiscoveredScreen';
import DetailScreen from '../screens/DetailScreen';
import VoiceScreen from '../screens/VoiceScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused, color }) {
  return <Ionicons name={name} size={22} color={color} />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(7,8,12,0.96)',
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 22,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      })}
    >
      <Tab.Screen
        name="AR"
        component={ARViewScreen}
        options={{
          tabBarLabel: 'AR',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'scan' : 'scan-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Hartă',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'map' : 'map-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Discovered"
        component={DiscoveredScreen}
        options={{
          tabBarLabel: 'Descoperite',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'albums' : 'albums-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Voice"
        component={VoiceScreen}
        options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
