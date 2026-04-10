import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useTheme } from '../ThemeContext';
import { analyzeEmailImportance, analyzeEmailDeadline, analyzeEmailAlert } from '../utils/emailAnalyzer';

export default function InsightsScreen() {
  const { colors } = useTheme();
  const [stats, setStats] = useState({ important: 12, deadlines: 5, alerts: 3, total: 20 });
  const [topSender, setTopSender] = useState({ name: 'UTA Financial Aid', count: 4 });
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({ 
    Inter_400Regular, 
    Inter_500Medium, 
    Inter_600SemiBold, 
    Inter_700Bold 
  });

  const loadInsights = async () => {
    try {
      let accessToken;
      try {
        const tokens = await GoogleSignin.getTokens();
        accessToken = tokens.accessToken;
      } catch(e) {
        await GoogleSignin.signInSilently();
        const tokens = await GoogleSignin.getTokens();
        accessToken = tokens.accessToken;
      }
      const query = encodeURIComponent('in:inbox category:primary is:important -category:promotions -category:social');
      const listResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=25&q=${query}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const listData = await listResponse.json();
      
      if (!listData.messages) { setLoading(false); return; }

      let imp = 0, dead = 0, alr = 0;
      const senders: Record<string, number> = {};

      const emailPromises = listData.messages.map(async (msg: any) => {
        const detailResp = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, { headers: { Authorization: `Bearer ${accessToken}` } });
        const detailData = await detailResp.json();
        let subject = '', senderName = '';
        if (detailData.payload && detailData.payload.headers) {
          detailData.payload.headers.forEach((h: any) => {
            if (h.name === 'Subject') subject = h.value;
            if (h.name === 'From') senderName = h.value.split('<')[0].trim();
          });
        }
        const impResult = analyzeEmailImportance(subject, senderName, detailData.snippet || '');
        const deadlineResult = analyzeEmailDeadline(subject, detailData.snippet || '');
        const alertResult = analyzeEmailAlert(subject, detailData.snippet || '');
        
        if (alertResult.surface || deadlineResult.surface || impResult.surface) {
          if (alertResult.surface) alr++;
          else if (deadlineResult.surface) dead++;
          else if (impResult.surface) imp++;

          if (senderName) {
              senders[senderName] = (senders[senderName] || 0) + 1;
          }
        }
      });
      await Promise.all(emailPromises);
      
      setStats({ important: imp, deadlines: dead, alerts: alr, total: imp + dead + alr });
      
      let maxSender = 'None', maxCount = 0;
      for (const [s, c] of Object.entries(senders)) {
          if (c > maxCount) { maxCount = c; maxSender = s; }
      }
      setTopSender({ name: maxSender, count: maxCount });
    } catch(e) {
      console.log('Error fetching insights', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInsights(); }, []);
  
  if (!fontsLoaded) return null;

  return (
    <View style={[styles.bg, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator size="large" color={colors.text} /></View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.greeting, { color: colors.subtext }]}>Smart summary</Text>
              <Text style={[styles.title, { color: colors.text }]}>Insights</Text>
            </View>

            {/* Hero Card */}
            <View style={[styles.heroCard, { backgroundColor: colors.heroBg }]}>
              <Text style={[styles.heroSub, { color: colors.heroSub }]}>RECENT HIGHLIGHTS</Text>
              <Text style={[styles.heroTitle, { color: colors.heroText }]}>You stayed on top of things.</Text>
              <Text style={[styles.heroDesc, { color: colors.heroSub }]}>
                <Text style={{color: '#6658EA', fontFamily: 'Inter_600SemiBold'}}>{stats.deadlines} deadlines</Text> surfaced early and <Text style={{color: '#6658EA', fontFamily: 'Inter_600SemiBold'}}>{stats.alerts} alerts</Text> were automatically pushed higher in your inbox.
              </Text>
            </View>

            {/* Stat Grid */}
            <View style={styles.grid}>
              <View style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.gridTopRow}>
                   <View style={[styles.gridIconWrap, { backgroundColor: '#EFEAFC' }]}>
                     <Feather name="mail" size={16} color="#6658EA" />
                   </View>
                   <Text style={[styles.gridValue, { color: colors.text }]}>{stats.important}</Text>
                </View>
                <Text style={[styles.gridLabel, { color: colors.subtext }]}>IMPORTANT EMAILS</Text>
              </View>
              <View style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.gridTopRow}>
                   <View style={[styles.gridIconWrap, { backgroundColor: '#FCE8E6' }]}>
                     <Feather name="clock" size={16} color="#ea4335" />
                   </View>
                   <Text style={[styles.gridValue, { color: colors.text }]}>{stats.deadlines}</Text>
                </View>
                <Text style={[styles.gridLabel, { color: colors.subtext }]}>DEADLINES TRACKED</Text>
              </View>
              <View style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.gridTopRow}>
                   <View style={[styles.gridIconWrap, { backgroundColor: '#FFF7E6' }]}>
                     <Feather name="bell" size={16} color="#EA8600" />
                   </View>
                   <Text style={[styles.gridValue, { color: colors.text }]}>{stats.alerts}</Text>
                </View>
                <Text style={[styles.gridLabel, { color: colors.subtext }]}>ALERTS CAUGHT</Text>
              </View>
              <View style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.gridTopRow}>
                   <View style={[styles.gridIconWrap, { backgroundColor: '#EFEAFC' }]}>
                     <Feather name="bar-chart-2" size={16} color="#6658EA" />
                   </View>
                   <Text style={[styles.gridValue, { color: colors.text }]}>{stats.total}</Text>
                </View>
                <Text style={[styles.gridLabel, { color: colors.subtext }]}>TOTAL ANALYZED</Text>
              </View>
            </View>

            {/* Top Sender */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Top sender recently</Text>
              <View style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={styles.senderAvatar}>
                    <Text style={styles.senderAvatarText}>{topSender.name ? topSender.name.charAt(0).toUpperCase() : '?'}</Text>
                  </View>
                  <View>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>{topSender.name}</Text>
                    <Text style={[styles.rowDesc, { color: colors.subtext }]}>{topSender.count} priority emails detected</Text>
                  </View>
                </View>
                <Text style={styles.senderCountNumber}>{topSender.count}</Text>
              </View>
            </View>

            {/* Recommendation */}
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationLabel}>RECOMMENDATION</Text>
              <Text style={styles.recommendationText}>
                Add the Clairo widget to your home screen to surface important incoming categories and stay ahead without checking your email app constantly.
              </Text>
            </View>

          </ScrollView>
        )}
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
  gridTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  gridIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridValue: { fontFamily: 'Inter_700Bold', fontSize: 32, color: '#1a1a1a' },
  gridLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#b3b3b3', letterSpacing: 1.5 },

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
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1a1a1a', marginBottom: 2 },
  rowDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8e8e8e' },
  senderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  senderAvatarText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#fff' },
  senderCountNumber: { fontFamily: 'Inter_600SemiBold', fontSize: 20, color: '#6658EA' },

  recommendationCard: {
    backgroundColor: '#F7F5FF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
  },
  recommendationLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#6658EA', letterSpacing: 1.2, marginBottom: 8, textTransform: 'uppercase' },
  recommendationText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#4A3D9E', lineHeight: 22 },
});
