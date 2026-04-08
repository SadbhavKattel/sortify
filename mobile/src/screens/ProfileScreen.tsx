import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [fontsLoaded] = useFonts({ 
    Inter_400Regular, 
    Inter_500Medium, 
    Inter_600SemiBold, 
    Inter_700Bold 
  });
  
  if (!fontsLoaded) return null;

  const MenuItem = ({ icon, title, subtitle, targetScreen }: { icon: any, title: string, subtitle: string, targetScreen: string }) => (
    <TouchableOpacity activeOpacity={0.7} style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => navigation.navigate(targetScreen as never)}>
      <View style={styles.menuLeft}>
        <View style={[styles.iconCircle, { backgroundColor: colors.badgeBg }]}>
          <Feather name={icon} size={20} color={colors.subtext} />
        </View>
        <View>
          <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.menuSubtitle, { color: colors.subtext }]}>{subtitle}</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={colors.border} />
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
          <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.heroBg }]}>
              <Text style={[styles.avatarText, { color: colors.heroText }]}>PL</Text>
            </View>
            <View style={styles.profileTextContainer}>
              <Text style={[styles.profileName, { color: colors.text }]}>Pratik Lamichhane</Text>
              <Text style={[styles.profileStatus, { color: colors.subtext }]}>Connected with Gmail</Text>
            </View>
          </View>

          {/* Nav Items */}
          <View style={styles.menuList}>
            <MenuItem icon="bell" title="Notifications" subtitle="Priority alerts, reminders" targetScreen="Notifications" />
            <MenuItem icon="sun" title="AI Preferences" subtitle="Priority rules and smart sorting" targetScreen="AIPreferences" />
            <MenuItem icon="settings" title="App Settings" subtitle="Theme, privacy, sync" targetScreen="AppSettings" />
            <MenuItem icon="mail" title="Connected Accounts" subtitle="1 Gmail account active" targetScreen="ConnectedAccounts" />
          </View>

          {/* Plan Info */}
          <View style={[styles.planCard, { backgroundColor: colors.cardSecondary }]}>
            <Text style={[styles.planTitle, { color: colors.text }]}>Current plan</Text>
            <Text style={[styles.planDesc, { color: colors.subtext }]}>
              Minimal smart inbox with email scoring, deadline detection, and focused alerts.
            </Text>
          </View>
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
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
  profileName: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: '#1a1a1a', marginBottom: 4 },
  profileStatus: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8e8e8e' },

  menuList: {
    gap: 12,
    marginBottom: 32,
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
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1a1a1a', marginBottom: 2 },
  menuSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8e8e8e' },

  planCard: {
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  planTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1a1a1a', marginBottom: 8 },
  planDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8e8e8e', lineHeight: 22 },
});
