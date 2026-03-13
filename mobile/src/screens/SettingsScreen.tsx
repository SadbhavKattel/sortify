/**
 * SettingsScreen.tsx
 * 
 * User settings: connected Gmail account, widget instructions,
 * dark mode toggle, and sync controls. Uses styled View-based icons
 * instead of emojis for a consistent, professional look.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useTheme } from '../ThemeContext';

export default function SettingsScreen({ navigation }: any) {
  const [userEmail, setUserEmail] = useState('Loading...');
  const { theme, toggleTheme, colors } = useTheme();
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    (async () => {
      try {
        const user = await GoogleSignin.getCurrentUser();
        const u = user as any;
        setUserEmail(u?.user?.email || u?.data?.user?.email || 'Connected');
      } catch { setUserEmail('Connected'); }
    })();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.bg, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backWrap}>
          <BlurView intensity={30} tint={colors.blurTint} style={[styles.backBlur, { backgroundColor: colors.blurBg }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 8, height: 8, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: colors.text, transform: [{ rotate: '45deg' }], marginRight: 6 }} />
              <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
            </View>
          </BlurView>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {/* Connected Accounts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Connected Accounts</Text>
          <BlurView intensity={30} tint={colors.blurTint} style={[styles.glassCard, { borderColor: colors.border }]}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.text }]}>Google Mail</Text>
                <Text style={[styles.subLabel, { color: colors.subtext }]} numberOfLines={1}>{userEmail}</Text>
              </View>
              <TouchableOpacity style={[styles.disconnectBtn, { borderColor: colors.accent + '40' }]} onPress={async () => { try { await GoogleSignin.signOut(); navigation.replace('Onboarding'); } catch {} }}>
                <Text style={[styles.disconnectText, { color: colors.accent }]}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>

        {/* Widget */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Home Screen Widget</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => Alert.alert('Add Widget', 'To add the Sortify widget:\n\n1. Go to your Home Screen\n2. Long press on an empty area\n3. Tap "Widgets"\n4. Find "Sortify" and drag it', [{ text: 'Got it!' }])}>
            <BlurView intensity={30} tint={colors.blurTint} style={[styles.actionCard, { backgroundColor: colors.blurBg }]}>
              <Text style={[styles.actionText, { color: colors.text }]}>Add Widget to Home Screen</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Appearance</Text>
          <BlurView intensity={30} tint={colors.blurTint} style={[styles.glassCard, { borderColor: colors.border }]}>
            <View style={styles.row}>
              <Text style={[styles.prefText, { color: colors.text }]}>Dark Mode</Text>
              <Switch value={theme === 'dark'} onValueChange={toggleTheme} trackColor={{ false: 'rgba(120,120,120,0.3)', true: colors.accent + '80' }} thumbColor={theme === 'dark' ? '#FFF' : '#E8E4DE'} />
            </View>
          </BlurView>
        </View>

        {/* Sync */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Sync</Text>
          <BlurView intensity={30} tint={colors.blurTint} style={[styles.glassCard, { borderColor: colors.border }]}>
            <View style={styles.row}>
              <Text style={[styles.prefText, { color: colors.text }]}>Background Sync</Text>
              <Text style={[styles.prefVal, { color: colors.subtext }]}>15 mins</Text>
            </View>
          </BlurView>
          <TouchableOpacity activeOpacity={0.8} onPress={() => { Alert.alert('Syncing...', 'Refreshing urgent emails.'); navigation.goBack(); }} style={{ marginTop: 16 }}>
            <BlurView intensity={30} tint={colors.blurTint} style={[styles.actionCard, { backgroundColor: colors.blurBg }]}>
              <Text style={[styles.actionText, { color: colors.text }]}>Force Sync Now</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 }, container: { flex: 1, padding: 24 },
  backWrap: { alignSelf: 'flex-start', borderRadius: 20, overflow: 'hidden', marginBottom: 30 },
  backBlur: { paddingHorizontal: 16, paddingVertical: 10 },
  backText: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 40, marginBottom: 40, letterSpacing: -1 },
  section: { marginBottom: 30 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 2 },
  glassCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 17, marginBottom: 3 },
  subLabel: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  disconnectBtn: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: 'rgba(184,58,47,0.08)', borderRadius: 14, borderWidth: 1 },
  disconnectText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  prefText: { fontFamily: 'Inter_500Medium', fontSize: 17 },
  prefVal: { fontFamily: 'Inter_400Regular', fontSize: 15 },
  actionCard: { borderRadius: 24, overflow: 'hidden', paddingVertical: 18, alignItems: 'center' },
  actionText: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
});
