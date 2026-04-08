import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';

export default function AppSettingsScreen() {
  const navigation = useNavigation();
  const { theme, toggleTheme, colors } = useTheme();
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  
  const [syncIdx, setSyncIdx] = useState(0);
  const syncs = ["5 min", "15 min", "Manual"];
  
  const [privacyIdx, setPrivacyIdx] = useState(0);
  const privacies = ["Secure", "Standard"];
  
  const [focusOn, setFocusOn] = useState(false);

  if (!fontsLoaded) return null;

  const RowItem = ({ icon, title, subtitle, value, onPress }: any) => (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconCircle, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
          <Feather name={icon} size={18} color={colors.subtext} />
        </View>
        <View>
          <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>{subtitle}</Text>
        </View>
      </View>
      <Text style={[styles.rowValue, { color: colors.subtext }]}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.bg, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.headerWrap}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.badgeBg }]}>
            <Feather name="arrow-left" size={20} color={colors.badgeText} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.greeting, { color: colors.subtext }]}>Theme, privacy, sync</Text>
            <Text style={[styles.title, { color: colors.text }]}>App Settings</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.list}>
            <RowItem icon="aperture" title="Appearance" subtitle="Minimal mode active" value={theme === 'light' ? 'Light' : 'Dark'} onPress={toggleTheme} />
            <RowItem icon="refresh-cw" title="Sync frequency" subtitle="How often inbox refreshes" value={syncs[syncIdx]} onPress={() => setSyncIdx((syncIdx + 1) % syncs.length)} />
            <RowItem icon="lock" title="Privacy" subtitle="Face ID and local protection" value={privacies[privacyIdx]} onPress={() => setPrivacyIdx((privacyIdx + 1) % privacies.length)} />
            <RowItem icon="moon" title="Focus mode" subtitle="Reduce non-essential alerts" value={focusOn ? "On" : "Off"} onPress={() => setFocusOn(!focusOn)} />
            <RowItem icon="shield" title="Permissions" subtitle="Notification and Gmail access" value="Granted" onPress={() => {}} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flex: 1 },
  headerWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, marginBottom: 24 },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  greeting: { fontFamily: 'Inter_500Medium', fontSize: 12, marginBottom: 2 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 24, letterSpacing: -0.5 },
  
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  list: { gap: 12 },
  rowCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 20, padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, marginBottom: 2 },
  rowSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  rowValue: { fontFamily: 'Inter_500Medium', fontSize: 14 },
});

