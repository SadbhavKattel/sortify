/**
 * App.tsx — Root of the Sortify mobile app.
 * 
 * Wraps everything in ThemeProvider (dark mode), SafeAreaProvider (notch-safe),
 * and NavigationContainer (screen routing).
 * 
 * Flow: Onboarding → Feed → Detail (tap email) / Settings (gear icon)
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/ThemeContext';
import OnboardingScreen from './src/screens/OnboardingScreen';
import FeedScreen from './src/screens/FeedScreen';
import DetailScreen from './src/screens/DetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Onboarding"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#121212' }
            }}
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Feed" component={FeedScreen} />
            <Stack.Screen name="Detail" component={DetailScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
