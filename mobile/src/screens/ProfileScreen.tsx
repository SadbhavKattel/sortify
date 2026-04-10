import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useTheme } from '../ThemeContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await GoogleSignin.getCurrentUser();
        setUserInfo(currentUser?.user);
      } catch(e) {
        console.log("Could not load user profile", e);
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        })
      );
    } catch (error) {
      console.log('Sign out error', error);
    }
  };
  const [fontsLoaded] = useFonts({ 
    Inter_400Regular, 
    Inter_500Medium, 
    Inter_600SemiBold, 
    Inter_700Bold 
  });
  
  if (!fontsLoaded) return null;

  const MenuItem = ({ icon, bg, title, subtitle, rightText, targetScreen }: any) => (
    <TouchableOpacity activeOpacity={0.7} style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => navigation.navigate(targetScreen as never)}>
      <View style={styles.menuLeft}>
        <View style={[styles.iconSquare, { backgroundColor: bg }]}>
          <Feather name={icon} size={18} color="#6658EA" />
        </View>
        <View>
          <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.menuSubtitle, { color: colors.subtext }]}>{subtitle}</Text>
        </View>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {rightText && <Text style={{fontFamily: 'Inter_500Medium', fontSize: 13, color: '#b3b3b3', marginRight: 4}}>{rightText}</Text>}
        <Feather name="chevron-right" size={18} color="#d9d9d9" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.bg, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.greeting, { color: colors.subtext }]}>Account</Text>
            <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
          </View>

          {/* Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: '#111', borderColor: '#222' }]}>
            {userInfo?.photo ? (
              <Image source={{ uri: userInfo.photo }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#332688' }]}>
                <Text style={[styles.avatarText, { color: '#ffffff' }]}>
                  {userInfo?.name ? userInfo.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            <View style={styles.profileTextContainer}>
              <Text style={[styles.profileName, { color: '#fff' }]}>{userInfo?.name || 'Loading...'}</Text>
              <Text style={[styles.profileEmail, { color: '#aaa', fontSize: 13 }]} numberOfLines={1}>{userInfo?.email}</Text>
              <Text style={[styles.profileStatus, { color: '#2EB886', fontSize: 12, marginTop: 4 }]} numberOfLines={1}>🟢 Gmail connected</Text>
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>PREFERENCES</Text>
            <View style={styles.menuList}>
              <MenuItem icon="bell" bg="#F6EFFF" title="Notifications" subtitle="Priority alerts, reminders" rightText="On" targetScreen="Notifications" />
              <MenuItem icon="info" bg="#EAF2FF" title="About Clairo" subtitle="Version and app info" targetScreen="AIPreferences" />
              <MenuItem icon="settings" bg="#F3F3F3" title="App Settings" subtitle="Theme and appearance" targetScreen="AppSettings" />
              <MenuItem icon="mail" bg="#E6F7F5" title="Connected Accounts" subtitle="Manage Google access" targetScreen="ConnectedAccounts" />
            </View>
          </View>

          {/* Current Plan */}
          <View style={styles.sectionWrap}>
             <Text style={styles.sectionTitle}>CURRENT PLAN</Text>
             <View style={[styles.planCard, { borderColor: colors.border }]}>
                <View style={styles.planTopRow}>
                   <Text style={[styles.planCardTitle, { color: colors.text }]}>Clairo Free</Text>
                   <View style={styles.activePill}><Text style={styles.activePillText}>Active</Text></View>
                </View>
                <Text style={[styles.planDesc, { color: colors.subtext, marginBottom: 0 }]}>Smart inbox with email scoring, deadline detection, and focused alerts.</Text>
             </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity activeOpacity={0.7} style={styles.minimalSignOutBtn} onPress={handleSignOut}>
            <View style={styles.signOutLeftWrap}>
               <View style={styles.signOutIconWrap}>
                 <Feather name="log-out" size={18} color="#ea4335" />
               </View>
               <View>
                 <Text style={styles.signOutTitle}>Sign out</Text>
                 <Text style={styles.signOutDesc}>You'll need to reconnect Gmail</Text>
               </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 16 },
  header: { marginBottom: 20 },
  greeting: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#8e8e8e', marginBottom: 2 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 26, color: '#1a1a1a', letterSpacing: -0.5 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#332688',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#ffffff',
  },
  profileTextContainer: { flex: 1 },
  profileName: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: '#fff', marginBottom: 2 },
  profileEmail: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#aaa' },
  profileStatus: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#2EB886', marginTop: 4 },

  sectionWrap: { marginBottom: 32 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#b3b3b3', letterSpacing: 1.2, marginBottom: 12, marginLeft: 4, textTransform: 'uppercase' },

  menuList: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 20,
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1a1a1a', marginBottom: 2 },
  menuSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8e8e8e' },

  planCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f0f0f0', borderRadius: 20, padding: 20 },
  planTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  planCardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#1a1a1a' },
  activePill: { backgroundColor: '#F6EFFF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  activePillText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#6658EA' },
  planDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8e8e8e', lineHeight: 20 },

  avatarImage: { width: 56, height: 56, borderRadius: 28, marginRight: 16 },
  
  minimalSignOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#fff',
    borderColor: '#ffebec', 
    marginBottom: 40,
  },
  signOutLeftWrap: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  signOutIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center' },
  signOutTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1a1a1a', marginBottom: 2 },
  signOutDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#ff8a8a' },
});
