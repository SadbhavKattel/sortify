/**
 * OnboardingScreen.tsx
 * 
 * First screen the user sees before connecting their Gmail.
 * Shows a 2x2 feature grid with styled icons (no emojis) that explains
 * what Clairo tracks: security alerts, travel, payments, appointments.
 * 
 * After tapping "Connect Gmail", uses native Google Sign-In (no browser)
 * to authenticate and get Gmail read access.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather, AntDesign } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';

const features = [
  { title: 'Security', sub: 'Breaches, password changes', icon: 'shield', iconColor: '#7A62EF', iconBg: '#EFEAFC' },
  { title: 'Travel', sub: 'Delays, gate changes', icon: 'send', iconColor: '#387CF6', iconBg: '#E8F1FE' },
  { title: 'Payments', sub: 'Failed charges, bills', icon: 'credit-card', iconColor: '#F5B02E', iconBg: '#FFF7E6' },
  { title: 'Appointments', sub: 'Deadlines, reminders', icon: 'calendar', iconColor: '#30BB8A', iconBg: '#E6FAF1' },
];

export default function OnboardingScreen({ navigation }: any) {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    // Use the Android client from google-services.json for native sign-in.
    // We only need Gmail access tokens in-app, not a server auth code.
    GoogleSignin.configure({
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      offlineAccess: false,
    });
    // Check play services once on mount to avoid delay during button press
    GoogleSignin.hasPlayServices().catch(() => {});
  }, []);

  /**
   * Native Google Sign-In flow:
   * 1. Opens the Android system account picker (no browser needed)
   * 2. Gets an access token with Gmail read-only scope
   * 3. Optionally syncs token with our backend
   * 4. Navigates to the Feed screen on success
   */
  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.signIn();
      navigation.replace('Feed');
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) { Alert.alert('Error', 'Google Play Services not available'); return; }
      Alert.alert('Sign-In Failed', `Error code: ${error.code}\nMessage: ${error.message}`);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.container}>
        <View style={[styles.hero, { alignItems: 'center' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={{ width: 84, height: 84, borderRadius: 24, marginRight: -12, resizeMode: 'cover' }} 
            />
            <Text style={styles.title}>Clairo</Text>
          </View>
          <Text style={[styles.tagline, { textAlign: 'center' }]}>What matters. Nothing else.</Text>
        </View>

        <View style={styles.grid}>
          {features.map((f, i) => {
            return (
              <View key={i} style={styles.featureCard}>
                <View style={[styles.iconWrap, { backgroundColor: f.iconBg }]}>
                  <Feather name={f.icon as any} size={20} color={f.iconColor} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
            );
          })}
        </View>

        {/* Main call-to-action */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity activeOpacity={0.8} style={styles.googleBtn} onPress={handleGoogleSignIn}>
            <AntDesign name="google" size={24} color="#1A1A1A" />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Quick privacy reassurance */}
        <Text style={styles.privacy}>We only read subject lines. Never stored.</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#F9F9F9' },
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  hero: { marginTop: 40 },
  logoSquare: { width: 56, height: 56, backgroundColor: '#0A0A0A', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  logoText: { fontFamily: 'Inter_400Regular', fontSize: 26, color: '#ffffff' },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 42, color: '#1A1A1A', letterSpacing: -1.5 },
  tagline: { fontFamily: 'Inter_400Regular', fontSize: 18, color: '#8e8e8e', marginTop: 12, letterSpacing: -0.3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 10 },
  featureCard: { width: '48%', borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#ececec', backgroundColor: '#ffffff' },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  featureTitle: { fontFamily: 'Inter_500Medium', fontSize: 16, color: '#1A1A1A', marginBottom: 6 },
  featureSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8e8e8e', lineHeight: 16 },
  buttonContainer: { overflow: 'hidden', paddingHorizontal: 0, marginTop: 10 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#ececec', borderRadius: 30, height: 60, gap: 12 },
  googleBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#1A1A1A' },
  privacy: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9E9892', textAlign: 'center', marginTop: 14, marginBottom: 10 },
});
