/**
 * DetailScreen.tsx
 * 
 * Shows the full detail view when you tap an email card.
 * Automatically extracts key info (dollar amounts, appointment times, 
 * dates, card numbers) and displays them in a structured summary card.
 * Also shows urgency reason and a "Open Original Email" button.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, NativeModules } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useTheme } from '../ThemeContext';

function extractKeyInfo(email: any): { label: string; value: string }[] {
  const info: { label: string; value: string }[] = [];
  if (email.receivedAt) {
    const d = new Date(email.receivedAt), now = new Date();
    const h = Math.floor((now.getTime() - d.getTime()) / 3600000);
    const days = Math.floor(h / 24);
    info.push({ label: 'Received', value: days > 0 ? `${days}d ago` : h > 0 ? `${h}h ago` : 'Just now' });
  }
  if (email.urgencyReasons) info.push({ label: 'Category', value: email.urgencyReasons });
  const full = `${email.subject || ''} ${email.snippet || ''}`;
  const money = full.match(/\$[\d,]+\.?\d*/); if (money) info.push({ label: 'Amount', value: money[0] });
  const time = full.match(/\d{1,2}:\d{2}\s*(AM|PM|am|pm)/); if (time) info.push({ label: 'Time', value: time[0] });
  const date = full.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}/i); if (date) info.push({ label: 'Date', value: date[0] });
  const card = full.match(/ending in \d{4}/i); if (card) info.push({ label: 'Card', value: card[0] });
  if (email.isUnread) info.push({ label: 'Status', value: 'Unread' });
  return info;
}

export default function DetailScreen({ route, navigation }: any) {
  const { email } = route.params;
  const { colors } = useTheme();
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  if (!fontsLoaded) return null;
  const keyInfo = extractKeyInfo(email);

  return (
    <View style={[styles.bg, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backWrap}>
            <BlurView intensity={30} tint={colors.blurTint} style={[styles.backBlur, { backgroundColor: colors.blurBg }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: colors.text, transform: [{ rotate: '45deg' }], marginRight: 6 }} />
                <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
              </View>
            </BlurView>
          </TouchableOpacity>

          <Text style={[styles.subject, { color: colors.text }]}>{email.subject}</Text>
          <View style={styles.senderRow}>
            <View style={[styles.avatar, { backgroundColor: colors.accent + '20' }]}>
              <Text style={[styles.avatarText, { color: colors.accent }]}>{email.senderName?.charAt(0) || '?'}</Text>
            </View>
            <View>
              <Text style={[styles.senderName, { color: colors.text }]}>{email.senderName}</Text>
              <Text style={[styles.senderDate, { color: colors.subtext }]}>{email.receivedAt?.substring(0, 10)}</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.accent }]}>Key Information</Text>
          <BlurView intensity={25} tint={colors.blurTint} style={[styles.infoCard, { borderColor: colors.border }]}>
            {keyInfo.map((item, idx) => (
              <View key={idx} style={[styles.infoRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Text style={[styles.infoLabel, { color: colors.subtext }]}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: item.label === 'Amount' || item.label === 'Time' ? colors.accent : colors.text }]}>{item.value}</Text>
              </View>
            ))}
          </BlurView>

          <BlurView intensity={20} tint={colors.blurTint} style={[styles.reasonCard, { borderLeftColor: colors.accent }]}>
            <Text style={[styles.reasonTitle, { color: colors.subtext }]}>Why this is urgent</Text>
            <Text style={[styles.reasonText, { color: colors.text }]}>{email.urgencyReasons}</Text>
          </BlurView>

          <BlurView intensity={20} tint={colors.blurTint} style={[styles.bodyCard, { borderColor: colors.border }]}>
            <Text style={[styles.bodyText, { color: colors.text }]}>{email.snippet || "No preview available..."}</Text>
          </BlurView>

          <TouchableOpacity style={styles.actionBtn} onPress={() => { const threadId = email.deepLinkUrl?.split('/').pop() || email.id; NativeModules.WidgetData?.openGmailMessage(threadId); }} activeOpacity={0.8}>
            <BlurView intensity={40} tint={colors.blurTint} style={[styles.actionBlur, { backgroundColor: colors.accent + '18' }]}>
              <Text style={[styles.actionText, { color: colors.accent }]}>Open Original Email</Text>
            </BlurView>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 }, container: { flex: 1 }, scroll: { padding: 24 },
  backWrap: { alignSelf: 'flex-start', borderRadius: 20, overflow: 'hidden', marginBottom: 30 },
  backBlur: { paddingHorizontal: 16, paddingVertical: 10 },
  backText: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  subject: { fontFamily: 'Inter_700Bold', fontSize: 28, marginBottom: 24, letterSpacing: -0.8, lineHeight: 36 },
  senderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  senderName: { fontFamily: 'Inter_600SemiBold', fontSize: 18, marginBottom: 2 },
  senderDate: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 },
  infoCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, marginBottom: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  infoLabel: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  infoValue: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  reasonCard: { padding: 20, borderRadius: 20, marginBottom: 24, borderLeftWidth: 4, overflow: 'hidden' },
  reasonTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  reasonText: { fontFamily: 'Inter_500Medium', fontSize: 16 },
  bodyCard: { padding: 24, borderRadius: 24, minHeight: 120, marginBottom: 30, overflow: 'hidden', borderWidth: 1 },
  bodyText: { fontFamily: 'Inter_400Regular', fontSize: 17, lineHeight: 26 },
  actionBtn: { borderRadius: 30, overflow: 'hidden', marginBottom: 40 },
  actionBlur: { paddingVertical: 18, alignItems: 'center' },
  actionText: { fontFamily: 'Inter_600SemiBold', fontSize: 18 },
});
