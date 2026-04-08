import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useTheme } from '../ThemeContext';

export default function InsightsScreen() {
  const { colors } = useTheme();
  const [fontsLoaded] = useFonts({ 
    Inter_400Regular, 
    Inter_500Medium, 
    Inter_600SemiBold, 
    Inter_700Bold 
  });
  
  if (!fontsLoaded) return null;

  return (
    <View style={[styles.bg, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.greeting, { color: colors.subtext }]}>Smart summary</Text>
            <Text style={[styles.title, { color: colors.text }]}>Insights</Text>
          </View>

          {/* Hero Card */}
          <View style={[styles.heroCard, { backgroundColor: colors.heroBg }]}>
            <Text style={[styles.heroSub, { color: colors.heroSub }]}>This week</Text>
            <Text style={[styles.heroTitle, { color: colors.heroText }]}>You stayed on top of things.</Text>
            <Text style={[styles.heroDesc, { color: colors.heroSub }]}>
              2 deadlines were surfaced early and 3 alerts were automatically pushed higher in your inbox.
            </Text>
          </View>

          {/* Stat Grid */}
          <View style={styles.grid}>
            <View style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="mail" size={18} color={colors.subtext} style={styles.gridIcon} />
              <Text style={[styles.gridValue, { color: colors.text }]}>12</Text>
              <Text style={[styles.gridLabel, { color: colors.subtext }]}>Important emails</Text>
            </View>
            <View style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="clock" size={18} color={colors.subtext} style={styles.gridIcon} />
              <Text style={[styles.gridValue, { color: colors.text }]}>5</Text>
              <Text style={[styles.gridLabel, { color: colors.subtext }]}>Deadlines tracked</Text>
            </View>
            <View style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="alert-circle" size={18} color={colors.subtext} style={styles.gridIcon} />
              <Text style={[styles.gridValue, { color: colors.text }]}>3</Text>
              <Text style={[styles.gridLabel, { color: colors.subtext }]}>Alerts caught</Text>
            </View>
            <View style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="zap" size={18} color={colors.subtext} style={styles.gridIcon} />
              <Text style={[styles.gridValue, { color: colors.text }]}>89%</Text>
              <Text style={[styles.gridLabel, { color: colors.subtext }]}>Saved from missing</Text>
            </View>
          </View>

          {/* Top Sender */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top sender this week</Text>
            <TouchableOpacity activeOpacity={0.7} style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>UTA Financial Aid</Text>
                <Text style={[styles.rowDesc, { color: colors.subtext }]}>4 Important emails detected</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.border} />
            </TouchableOpacity>
          </View>

          {/* Recommendation */}
          <View style={[styles.section, { paddingBottom: 40 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommendation</Text>
            <TouchableOpacity activeOpacity={0.7} style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowDesc, { color: colors.subtext }]}>
                  Turn on instant notifications for job applications and academic deadlines to stay ahead.
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.border} />
            </TouchableOpacity>
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
  
  heroCard: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },
  heroSub: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  heroTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 28, color: '#ffffff', lineHeight: 34, marginBottom: 16, letterSpacing: -0.5 },
  heroDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#aaaaaa', lineHeight: 22 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 20,
    padding: 16,
  },
  gridIcon: { marginBottom: 12 },
  gridValue: { fontFamily: 'Inter_600SemiBold', fontSize: 24, color: '#1a1a1a', marginBottom: 4 },
  gridLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#8e8e8e' },

  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 8,
    marginLeft: 4,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 16,
    padding: 16,
  },
  rowTitle: { fontFamily: 'Inter_500Medium', fontSize: 16, color: '#1a1a1a', marginBottom: 4 },
  rowDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8e8e8e', lineHeight: 18 },
});
