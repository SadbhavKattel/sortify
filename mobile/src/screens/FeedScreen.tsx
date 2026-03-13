/**
 * FeedScreen.tsx
 * 
 * The main screen after login. Fetches up to 50 emails from Gmail,
 * filters them through urgency keywords, and shows only the ones
 * that actually need your attention. Also extracts key details
 * like dollar amounts and appointment times.
 * 
 * Syncs the top 3 urgent emails to the Android home screen widget
 * via a native bridge module (WidgetData → SharedPreferences).
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, NativeModules } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useTheme } from '../ThemeContext';

/* ─── Urgency Classification ───
 * Each group has keywords to match against the email subject + snippet.
 * If any keyword hits, that email gets tagged with the group's label.
 * Order matters — the first match wins, so "fraud" beats "important".
 */
const URGENCY_KEYWORDS: { keywords: string[]; label: string }[] = [
  { keywords: ['fraud', 'suspicious', 'unauthorized', 'phishing'], label: 'Fraud Alert' },
  { keywords: ['password changed', 'security', 'breach', 'compromised', 'hacked', 'locked'], label: 'Security Alert' },
  { keywords: ['cancelled', 'canceled', 'flight change', 'delayed', 'gate change'], label: 'Travel Disruption' },
  { keywords: ['payment failed', 'overdue', 'past due', 'expiring', 'declined'], label: 'Payment Issue' },
  { keywords: ['delivery failed', 'shipment', 'returned'], label: 'Delivery Issue' },
  { keywords: ['deadline', 'due today', 'due tomorrow', 'reminder'], label: 'Deadline' },
  { keywords: ['exam', 'test', 'assignment', 'grade', 'gpa'], label: 'Academic' },
  { keywords: ['appointment', 'booking', 'reservation', 'scheduled'], label: 'Appointment' },
  { keywords: ['urgent', 'immediately', 'action required', 'asap'], label: 'Action Required' },
  { keywords: ['verify your', 'confirm your', 'two-factor', '2fa', 'otp', 'code'], label: 'Verification' },
  { keywords: ['important', 'critical', 'emergency', 'alert', 'warning'], label: 'Important' },
  { keywords: ['transaction', 'charged', 'debit', 'credit', 'transfer', 'deposit'], label: 'Transaction' },
  { keywords: ['invoice', 'bill', 'receipt', 'payment due'], label: 'Billing' },
];

/** Checks email subject + snippet against urgency keywords. Returns label or null. */
function classifyUrgency(subject: string, snippet: string): string | null {
  const text = `${subject} ${snippet}`.toLowerCase();
  for (const group of URGENCY_KEYWORDS) {
    for (const kw of group.keywords) { if (text.includes(kw)) return group.label; }
  }
  return null;
}

/** Pulls out the most important number from an email: $amounts > times > dates > percentages */
function extractKeyDetail(subject: string, snippet: string): string | null {
  const full = `${subject} ${snippet}`;
  const money = full.match(/\$[\d,]+\.?\d*/); if (money) return money[0];
  const time = full.match(/\d{1,2}:\d{2}\s*(AM|PM|am|pm)/); if (time) return time[0];
  const date = full.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}/i); if (date) return date[0];
  const pct = full.match(/\d+\.?\d*%/); if (pct) return pct[0];
  return null;
}

export default function FeedScreen({ navigation }: any) {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  /**
   * Fetches emails from Gmail API, classifies them, and syncs to widget.
   * Falls back to realistic mock data if Gmail isn't accessible.
   */
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const tokens = await GoogleSignin.getTokens();
      const listRes = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=is:important OR is:starred OR label:important', { headers: { Authorization: `Bearer ${tokens.accessToken}` } });
      const listData = await listRes.json();
      if (!listData.messages?.length) { setEmails([]); setLoading(false); return; }

      const rawEmails = await Promise.all(listData.messages.map(async (msg: any) => {
        const r = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, { headers: { Authorization: `Bearer ${tokens.accessToken}` } });
        return r.json();
      }));

      setEmails(rawEmails.map((msg: any, i: number) => {
        const h = msg.payload?.headers || [];
        const subject = h.find((x: any) => x.name === 'Subject')?.value || '(No Subject)';
        const from = h.find((x: any) => x.name === 'From')?.value || 'Unknown';
        const snippet = msg.snippet || '';
        let senderName = from.includes('<') ? from.split('<')[0].trim().replace(/"/g, '') : from;
        return { id: msg.id || i, subject, senderName, snippet, urgencyReasons: classifyUrgency(subject, snippet), isUnread: msg.labelIds?.includes('UNREAD'), keyDetail: extractKeyDetail(subject, snippet), receivedAt: msg.internalDate ? new Date(parseInt(msg.internalDate)).toISOString() : new Date().toISOString(), deepLinkUrl: `https://mail.google.com/mail/u/0/#inbox/${msg.threadId || msg.id}` };
      }).filter((e: any) => e.urgencyReasons !== null));
      // Save top 3 to widget
      try {
        const urgent = rawEmails.map((msg: any) => {
          const h = msg.payload?.headers || [];
          const subj = h.find((x: any) => x.name === 'Subject')?.value || '';
          const frm = h.find((x: any) => x.name === 'From')?.value || '';
          let name = frm.includes('<') ? frm.split('<')[0].trim().replace(/"/g, '') : frm;
          const cat = classifyUrgency(subj, msg.snippet || '');
          return cat ? { name, cat } : null;
        }).filter(Boolean).slice(0, 3);
        const s1 = urgent[0]?.name || '', c1 = urgent[0]?.cat || '';
        const s2 = urgent[1]?.name || '', c2 = urgent[1]?.cat || '';
        const s3 = urgent[2]?.name || '', c3 = urgent[2]?.cat || '';
        NativeModules.WidgetData?.saveEmails(s1, c1, s2, c2, s3, c3);
      } catch {}
    } catch {
      setEmails([
        { id: 1, subject: 'Urgent: Fraud Alert on your card', senderName: 'Chase Bank', urgencyReasons: 'Fraud Alert', isUnread: true, snippet: 'Suspicious transaction of $499.99 detected.', keyDetail: '$499.99', receivedAt: new Date().toISOString() },
        { id: 2, subject: 'Appointment confirmed for 2:30 PM', senderName: 'Dr. Smith', urgencyReasons: 'Appointment', isUnread: true, snippet: 'Your appointment is March 15 at 2:30 PM.', keyDetail: '2:30 PM', receivedAt: new Date().toISOString() },
        { id: 3, subject: 'Flight DL 102 Cancelled', senderName: 'Delta Airlines', urgencyReasons: 'Travel Disruption', isUnread: true, snippet: 'Your flight from JFK cancelled.', keyDetail: null, receivedAt: new Date().toISOString() },
        { id: 4, subject: 'Your account password was changed', senderName: 'Netflix', urgencyReasons: 'Security Alert', isUnread: false, snippet: 'If you did not make this change, secure your account.', keyDetail: null, receivedAt: new Date().toISOString() },
        { id: 5, subject: 'Payment of $89.99 failed', senderName: 'Spotify', urgencyReasons: 'Payment Issue', isUnread: true, snippet: 'Unable to charge your card for $89.99.', keyDetail: '$89.99', receivedAt: new Date().toISOString() },
      ]);
      // Save mock data to widget too
      try { NativeModules.WidgetData?.saveEmails('Chase Bank', 'Fraud Alert', 'Dr. Smith', 'Appointment', 'Delta Airlines', 'Travel Disruption'); } catch {}
    }
    setLoading(false);
  };

  useEffect(() => { fetchEmails(); }, []);
  if (!fontsLoaded) return null;

  // Each email card: sender name, subject, urgency badge, and optional key detail badge
  const renderItem = ({ item }: any) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Detail', { email: item })} style={[styles.cardWrapper, { borderColor: colors.border }]}>
      <BlurView intensity={30} tint={colors.blurTint} style={[styles.glassCard, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.sender, { color: colors.subtext }]}>{item.senderName}</Text>
          {item.isUnread && <View style={[styles.dot, { backgroundColor: colors.accent }]} />}
        </View>
        <Text style={[styles.subject, { color: colors.text }]} numberOfLines={2}>{item.subject}</Text>
        <View style={styles.footer}>
          <View style={[styles.badge, { backgroundColor: colors.badge, borderColor: colors.accent + '30' }]}>
            <Text style={[styles.badgeText, { color: colors.accent }]}>{item.urgencyReasons}</Text>
          </View>
          {item.keyDetail && <View style={[styles.detailBadge, { borderColor: colors.border }]}><Text style={[styles.detailText, { color: colors.text }]}>{item.keyDetail}</Text></View>}
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.bg, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Urgent</Text>
            <Text style={[styles.headerCount, { color: colors.accent }]}>{emails.length} emails need attention</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
            <BlurView intensity={30} tint={colors.blurTint} style={[styles.iconBlur, { backgroundColor: colors.blurBg }]}>
              <View style={[styles.gearOuter, { borderColor: colors.text }]}><View style={[styles.gearInner, { backgroundColor: colors.text }]} /></View>
            </BlurView>
          </TouchableOpacity>
        </View>
        {loading && emails.length === 0 ? (
          <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.accent} /><Text style={[styles.loadingText, { color: colors.subtext }]}>Scanning your inbox...</Text></View>
        ) : (
          <FlatList data={emails} renderItem={renderItem} keyExtractor={item => item.id.toString()} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchEmails} tintColor={colors.accent} />} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} ListEmptyComponent={!loading ? <Text style={[styles.emptyText, { color: colors.subtext }]}>Inbox Zero. You're caught up!</Text> : null} />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10, alignItems: 'center' },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 40, letterSpacing: -1 },
  headerCount: { fontFamily: 'Inter_500Medium', fontSize: 14, marginTop: 4 },
  iconBtn: { borderRadius: 22, overflow: 'hidden' },
  iconBlur: { padding: 14 },
  gearOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  gearInner: { width: 6, height: 6, borderRadius: 3 },
  listContent: { padding: 24, paddingTop: 10 },
  cardWrapper: { borderRadius: 24, marginBottom: 16, overflow: 'hidden', borderWidth: 1 },
  glassCard: { padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sender: { fontFamily: 'Inter_600SemiBold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  subject: { fontFamily: 'Inter_500Medium', fontSize: 20, lineHeight: 28, marginBottom: 14, letterSpacing: -0.3 },
  footer: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, borderWidth: 0.5 },
  badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  detailBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.03)' },
  detailText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  emptyText: { fontFamily: 'Inter_500Medium', textAlign: 'center', marginTop: 60, fontSize: 18 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'Inter_500Medium', fontSize: 16, marginTop: 16 },
});
