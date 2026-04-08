import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';

export default function AIPreferencesScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  
  const [smartRank, setSmartRank] = useState(true);
  const [urgencyIdx, setUrgencyIdx] = useState(0); // High, Medium, Low
  const urgencies = ["High", "Medium", "Low"];
  
  const [groupsIdx, setGroupsIdx] = useState(0); 
  const groupOpts = ["4 groups", "5 groups", "6 groups", "All"];
  
  const [strictIdx, setStrictIdx] = useState(0);
  const stricts = ["Balanced", "Strict", "Lenient"];

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
            <Text style={[styles.greeting, { color: colors.subtext }]}>Smart sorting</Text>
            <Text style={[styles.title, { color: colors.text }]}>AI Preferences</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Header Card */}
          <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.heroHeader}>
              <View style={[styles.blackCircle, { backgroundColor: colors.accent }]}>
                <Feather name="cpu" size={22} color={colors.bg} />
              </View>
              <View>
                <Text style={[styles.heroTitle, { color: colors.text }]}>Priority engine</Text>
                <Text style={[styles.heroSub, { color: colors.subtext }]}>{smartRank ? 'Learns from your actions over time' : 'Currently paused.'}</Text>
              </View>
            </View>
            <Text style={[styles.heroDesc, { color: colors.subtext }]}>
              The app uses sender importance, deadlines, wording urgency, and your previous taps to rank emails.
            </Text>
          </View>

          {/* Configuration List */}
          <View style={styles.list}>
            <RowItem icon="sun" title="Smart ranking" subtitle="Auto-sort important emails first" value={smartRank ? "On" : "Off"} onPress={() => setSmartRank(!smartRank)} />
            <RowItem icon="zap" title="Urgency detection" subtitle="Words like urgent, due, action needed" value={urgencies[urgencyIdx]} onPress={() => setUrgencyIdx((urgencyIdx + 1) % urgencies.length)} />
            <RowItem icon="star" title="Preferred senders" subtitle="Professors, jobs, finance, security" value={groupOpts[groupsIdx]} onPress={() => setGroupsIdx((groupsIdx + 1) % groupOpts.length)} />
            <RowItem icon="sliders" title="Scoring sensitivity" subtitle="How strict AI should be" value={stricts[strictIdx]} onPress={() => setStrictIdx((strictIdx + 1) % stricts.length)} />
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
  heroCard: { backgroundColor: '#fdfdfd', borderWidth: 1, borderColor: '#f0f0f0', borderRadius: 24, padding: 24, marginBottom: 24 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  blackCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#1a1a1a', marginBottom: 4 },
  heroSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8e8e8e' },
  heroDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8e8e8e', lineHeight: 22 },

  list: { gap: 12 },
  rowCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f0f0f0', borderRadius: 20, padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fdfdfd', borderWidth: 1, borderColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1a1a1a', marginBottom: 2 },
  rowSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8e8e8e' },
  rowValue: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#8e8e8e' },
});
