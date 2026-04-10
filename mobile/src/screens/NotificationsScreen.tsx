import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  
  const [pushOn, setPushOn] = useState(true);
  const [timingIdx, setTimingIdx] = useState(1); // 5, 15, 30, 60
  const timings = ["5 min", "15 min", "30 min", "1 hr"];
  const [soundOn, setSoundOn] = useState(true);
  const [lockHidden, setLockHidden] = useState(true);

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
            <Text style={[styles.greeting, { color: colors.subtext }]}>Alerts and reminders</Text>
            <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Black Hero Card */}
          <View style={[styles.heroCard, { backgroundColor: colors.heroBg }]}>
            <Text style={[styles.heroSub, { color: colors.heroSub }]}>Active now</Text>
            <Text style={[styles.heroTitle, { color: colors.heroText }]}>{pushOn ? 'Priority alerts are on' : 'Priority alerts are off'}</Text>
            <Text style={[styles.heroDesc, { color: colors.heroSub }]}>
              {pushOn ? 'You will be notified instantly for deadlines, important replies, and security-related emails.' : 'You will only receive minimal non-intrusive notifications.'}
            </Text>
          </View>

          {/* Configuration List */}
          <View style={styles.list}>
            <RowItem icon="bell" title="Push notifications" subtitle="Important and deadline emails" value={pushOn ? "On" : "Off"} onPress={() => setPushOn(!pushOn)} />
            <RowItem icon="clock" title="Reminder timing" subtitle="Follow-up and due-date reminders" value={timings[timingIdx]} onPress={() => setTimingIdx((timingIdx + 1) % timings.length)} />
            <RowItem icon="volume-2" title="Sound" subtitle="Soft notification sound" value={soundOn ? "Enabled" : "Disabled"} onPress={() => setSoundOn(!soundOn)} />
            <RowItem icon="smartphone" title="Lock screen preview" subtitle="Show sender and subject" value={lockHidden ? "Hidden" : "Show"} onPress={() => setLockHidden(!lockHidden)} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1 },
  headerWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, marginBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  greeting: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#8e8e8e', marginBottom: 2 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 24, color: '#1a1a1a', letterSpacing: -0.5 },
  
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  heroCard: { backgroundColor: '#121212', borderRadius: 24, padding: 24, marginBottom: 24 },
  heroSub: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#888', marginBottom: 12 },
  heroTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 22, color: '#ffffff', marginBottom: 12, letterSpacing: -0.5 },
  heroDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#aaaaaa', lineHeight: 22 },

  list: { gap: 12 },
  rowCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f0f0f0', borderRadius: 20, padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fdfdfd', borderWidth: 1, borderColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1a1a1a', marginBottom: 2 },
  rowSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8e8e8e' },
  rowValue: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#8e8e8e' },
});
