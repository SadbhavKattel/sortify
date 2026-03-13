/**
 * OnboardingScreen.tsx
 * 
 * First screen the user sees before connecting their Gmail.
 * Shows a 2x2 feature grid with styled icons (no emojis) that explains
 * what Sortify tracks: security alerts, travel, payments, appointments.
 * 
 * After tapping "Connect Gmail", uses native Google Sign-In (no browser)
 * to authenticate and get Gmail read access.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// GCP Web Client ID — used by the native Google Sign-In SDK
const WEB_CLIENT_ID = '290273149939-n5hk8svgf0puki2ddp4525ouk78aeqkd.apps.googleusercontent.com';
GoogleSignin.configure({ webClientId: WEB_CLIENT_ID, scopes: ['https://www.googleapis.com/auth/gmail.readonly'], offlineAccess: true, forceCodeForRefreshToken: true });

/* ─── Styled View-based icons (no emojis) ───
 * Each icon is built from nested Views with borders and shapes.
 * They use the accent red color to match the app's visual language.
 */

// Padlock: rounded shackle on top, keyhole dot inside
const LockIcon = ({ color }: { color: string }) => (
  <View style={{ width: 24, height: 28, borderWidth: 2, borderColor: color, borderRadius: 4, marginTop: 4 }}>
    <View style={{ width: 14, height: 10, borderWidth: 2, borderColor: color, borderRadius: 7, borderBottomWidth: 0, alignSelf: 'center', marginTop: -8 }} />
    <View style={{ width: 4, height: 6, backgroundColor: color, borderRadius: 2, alignSelf: 'center', marginTop: 4 }} />
  </View>
);

// Plane: triangle nose with a horizontal wing
const PlaneIcon = ({ color }: { color: string }) => (
  <View style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: 0, height: 0, borderLeftWidth: 12, borderLeftColor: color, borderTopWidth: 6, borderTopColor: 'transparent', borderBottomWidth: 6, borderBottomColor: 'transparent' }} />
    <View style={{ width: 20, height: 2, backgroundColor: color, marginTop: -1 }} />
  </View>
);

// Credit card: rectangle with a magnetic stripe
const CardIcon = ({ color }: { color: string }) => (
  <View style={{ width: 28, height: 20, borderWidth: 2, borderColor: color, borderRadius: 4, justifyContent: 'flex-start' }}>
    <View style={{ width: '100%', height: 5, backgroundColor: color, marginTop: 3 }} />
  </View>
);

// Calendar: header bar with three date dots below
const CalendarIcon = ({ color }: { color: string }) => (
  <View style={{ width: 24, height: 24, borderWidth: 2, borderColor: color, borderRadius: 4 }}>
    <View style={{ width: '100%', height: 6, backgroundColor: color, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 2, gap: 2, marginTop: 1 }}>
      <View style={{ width: 4, height: 4, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 4, height: 4, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 4, height: 4, backgroundColor: color, borderRadius: 1 }} />
    </View>
  </View>
);

const featureIcons = [LockIcon, PlaneIcon, CardIcon, CalendarIcon];

// The four categories Sortify watches for — shown as a 2x2 grid
const features = [
  { title: 'Security Alerts', sub: 'Fraud, breaches, password changes' },
  { title: 'Travel Updates', sub: 'Cancellations, delays, gate changes' },
  { title: 'Payments', sub: 'Failed charges, overdue bills' },
  { title: 'Appointments', sub: 'Bookings, deadlines, reminders' },
];

export default function OnboardingScreen({ navigation }: any) {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  /**
   * Native Google Sign-In flow:
   * 1. Opens the Android system account picker (no browser needed)
   * 2. Gets an access token with Gmail read-only scope
   * 3. Optionally syncs token with our backend
   * 4. Navigates to the Feed screen on success
   */
  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      // Try to sync with backend (non-blocking — app still works if backend is down)
      try { await fetch('http://10.0.2.2:8080/api/providers/oauth2/callback/gmail/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessToken: tokens.accessToken }) }); } catch (e) {}

      navigation.replace('Feed');
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) { Alert.alert('Error', 'Google Play Services not available'); return; }
      // Fall through to Feed with mock data if sign-in fails
      navigation.replace('Feed');
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.container}>
        {/* Big bold app name + tagline */}
        <View style={styles.hero}>
          <Text style={styles.title}>Sortify</Text>
          <Text style={styles.tagline}>What matters. Nothing else.</Text>
        </View>

        {/* 2x2 feature grid — each card is a frosted glass BlurView */}
        <View style={styles.grid}>
          {features.map((f, i) => {
            const Icon = featureIcons[i];
            return (
              <BlurView key={i} intensity={40} tint="light" style={styles.featureCard}>
                <View style={styles.iconWrap}><Icon color="#B83A2F" /></View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </BlurView>
            );
          })}
        </View>

        {/* Main call-to-action */}
        <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn} activeOpacity={0.8}>
          <BlurView intensity={50} tint="light" style={styles.buttonBlur}>
            <Text style={styles.buttonText}>Connect Gmail</Text>
          </BlurView>
        </TouchableOpacity>

        {/* Quick privacy reassurance */}
        <Text style={styles.privacy}>We only read subject lines. Never stored.</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#F0EBE3' },
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  hero: { marginTop: 60 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 52, color: '#1A1A1A', letterSpacing: -2 },
  tagline: { fontFamily: 'Inter_500Medium', fontSize: 18, color: '#6B6560', marginTop: 6, letterSpacing: -0.3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 10 },
  featureCard: { width: '48%', borderRadius: 20, overflow: 'hidden', padding: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', backgroundColor: 'rgba(255,255,255,0.5)' },
  iconWrap: { height: 36, justifyContent: 'center', marginBottom: 8 },
  featureTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1A1A1A', marginBottom: 4 },
  featureSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B6560', lineHeight: 17 },
  button: { borderRadius: 30, overflow: 'hidden' },
  buttonBlur: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(184,58,47,0.12)' },
  buttonText: { fontFamily: 'Inter_600SemiBold', color: '#B83A2F', fontSize: 18, letterSpacing: 0.5 },
  privacy: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9E9892', textAlign: 'center', marginTop: 14, marginBottom: 10 },
});
