/**
 * App.tsx — Root of the Clairo mobile app.
 */
import React from 'react';
import { View, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { ThemeProvider, useTheme } from './src/ThemeContext';
import OnboardingScreen from './src/screens/OnboardingScreen';
import FeedScreen from './src/screens/FeedScreen';
import DetailScreen from './src/screens/DetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import AIPreferencesScreen from './src/screens/AIPreferencesScreen';
import AppSettingsScreen from './src/screens/AppSettingsScreen';
import ConnectedAccountsScreen from './src/screens/ConnectedAccountsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

function ProfileStackScreen() {
  const { colors } = useTheme();
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
      <ProfileStack.Screen name="AIPreferences" component={AIPreferencesScreen} />
      <ProfileStack.Screen name="AppSettings" component={AppSettingsScreen} />
      <ProfileStack.Screen name="ConnectedAccounts" component={ConnectedAccountsScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: any = 'square';
          if (route.name === 'Inbox') iconName = 'mail';
          else if (route.name === 'Insights') iconName = 'activity';
          else if (route.name === 'Profile') iconName = 'user';
          
          if (focused) {
            return (
              <View style={{ backgroundColor: '#0f0f0f', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignItems: 'center', justifyContent: 'center', minWidth: 64 }}>
                <Feather name={iconName} size={18} color="#ffffff" />
                <Text style={{ color: '#ffffff', fontSize: 10, fontFamily: 'Inter_500Medium', marginTop: 2, textAlign: 'center' }}>{route.name}</Text>
              </View>
            );
          }
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center', minWidth: 64 }}>
              <Feather name={iconName} size={20} color={colors.subtext} />
              <Text style={{ color: colors.subtext, fontSize: 10, fontFamily: 'Inter_500Medium', marginTop: 4, textAlign: 'center' }}>{route.name}</Text>
            </View>
          );
        },
        tabBarStyle: { 
          height: Platform.OS === 'ios' ? 88 : 70, 
          borderTopWidth: 1, 
          borderTopColor: colors.border, 
          backgroundColor: '#ffffff', 
          paddingBottom: Platform.OS === 'ios' ? 24 : 10, 
          paddingTop: 10 
        }
      })}
    >
      <Tab.Screen name="Inbox" component={FeedScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { colors } = useTheme();
  const linking = {
    prefixes: ['clairo://'],
    config: {
      screens: {
        Feed: 'feed',
        Detail: 'email/:id',
      },
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <Stack.Navigator 
          initialRouteName="Onboarding"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg }
          }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Feed" component={MainTabs} />
          <Stack.Screen name="Detail" component={DetailScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}
