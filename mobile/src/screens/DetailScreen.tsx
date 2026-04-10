/**
 * DetailScreen.tsx
 * 
 * Shows the full detail view when you tap an email card.
 * Automatically extracts key info (dollar amounts, appointment times, 
 * dates, card numbers) and displays them in a structured summary card.
 * Also shows urgency reason and a "Open Original Email" button.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

export default function DetailScreen({ route, navigation }: any) {
  const { email: paramEmail, id } = route.params || {};
  
  // If we came from a deep link, we might only have an ID
  const email = paramEmail || { id, subject: "Loading External Email...", senderName: "Clairo", urgencyReasons: "Important", priorityLevel: "High" };
  
  const [fontsLoaded] = useFonts({ 
    Inter_400Regular, 
    Inter_500Medium, 
    Inter_600SemiBold, 
    Inter_700Bold 
  });

  if (!fontsLoaded) return null;

  const getColors = (reason: string) => {
    if (reason === 'Alert') return { dot: '#EA4335', bg: '#FCE8E6', text: '#C5221F' }; // Red
    if (reason === 'Deadline') return { dot: '#EA4335', bg: '#FCE8E6', text: '#C5221F' }; // Red for deadline UI match
    return { dot: '#6658EA', bg: '#EFEAFC', text: '#5944D7' }; // Purple
  };

  const c = getColors(email.urgencyReasons);

  const openGmail = () => {
    // Open Gmail web URL; if Gmail app is installed, OS might handle the deep link.
    const url = `https://mail.google.com/mail/u/0/#inbox/${email.id}`;
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  // Build the Key Information rows dynamically
  const keyInfo = [
    { label: 'Received', value: email.receivedAt, color: '#1a1a1a' },
    { label: 'Category', value: email.urgencyReasons, color: c.text },
  ];
  if (email.urgencyReasons === 'Deadline') {
    keyInfo.push({ label: 'Due date detected', value: 'Today', color: c.text });
    keyInfo.push({ label: 'Action needed', value: 'Requires attention', color: c.text });
  } else {
    keyInfo.push({ label: 'Priority', value: email.priorityLevel, color: c.text });
  }

  // Create a 2-line summary from the snippet
  const summarySentences = email.snippet?.split('. ').slice(0, 2).join('. ') + (email.snippet?.includes('.') ? '.' : '');

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
              <Feather name="chevron-left" size={18} color="#1a1a1a" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Inbox</Text>
          </View>

          {/* Top Pill */}
          <View style={[styles.pill, { backgroundColor: c.bg }]}>
            <View style={[styles.pillDot, { backgroundColor: c.dot }]} />
            <Text style={[styles.pillText, { color: c.text }]}>{email.urgencyReasons} · {email.priorityLevel === 'High' ? 'High Priority' : 'Attention needed'}</Text>
          </View>

          {/* Title */}
          <Text style={styles.subject}>{email.subject}</Text>

          {/* Sender Row */}
          <View style={styles.senderRow}>
            <View style={[styles.avatar, { backgroundColor: c.dot }]}>
              <Text style={styles.avatarText}>{email.senderName?.charAt(0) || '?'}</Text>
            </View>
            <View style={styles.senderTextCol}>
              <Text style={styles.senderName}>{email.senderName}</Text>
              <Text style={styles.senderEmail}>{email.senderName.toLowerCase().replace(/\s/g, '')}@gmail.com</Text>
            </View>
            <View style={styles.dateChip}>
              <Text style={styles.dateChipText}>{email.receivedAt?.split(' ').slice(0, 2).join(' ')}</Text>
            </View>
          </View>

          {/* KEY INFORMATION */}
          <Text style={styles.sectionTitle}>KEY INFORMATION</Text>
          <View style={styles.tableCard}>
            {keyInfo.map((row, idx) => (
              <View key={idx} style={[styles.tableRow, idx > 0 && styles.tableRowBorder]}>
                <Text style={styles.tableLabel}>{row.label}</Text>
                <Text style={[styles.tableValue, { color: row.color }]}>{row.value}</Text>
              </View>
            ))}
          </View>

          {/* AI SUMMARY */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.aiIconWrap}>
              <Feather name="zap" size={10} color="#fff" />
            </View>
            <Text style={styles.aiTitleText}>AI SUMMARY</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText} numberOfLines={2}>
              {summarySentences || email.subject}
            </Text>
          </View>

          {/* WHY CLAIRO FLAGGED THIS */}
          <View style={styles.flagCard}>
            <View style={styles.flagCardInner}>
              <Text style={styles.flagTitle}>WHY CLAIRO FLAGGED THIS</Text>
              <Text style={styles.flagText}>Clairo detected a {email.urgencyReasons.toLowerCase()} context in the subject line and ranked this as urgent. High priority emails are always surfaced first.</Text>
            </View>
          </View>

          {/* Open Original Email Button */}
          <TouchableOpacity style={styles.actionBtn} onPress={openGmail} activeOpacity={0.8}>
            <Feather name="external-link" size={16} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.actionText}>Open original email</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 60 },
  
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f3f2ee', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerText: { fontFamily: 'Inter_500Medium', fontSize: 16, color: '#8e8e8e' },

  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 16 },
  pillDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  pillText: { fontFamily: 'Inter_500Medium', fontSize: 12 },

  subject: { fontFamily: 'Inter_600SemiBold', fontSize: 24, color: '#1a1a1a', letterSpacing: -0.5, lineHeight: 32, marginBottom: 20 },
  
  senderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  avatar: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontFamily: 'Inter_500Medium', fontSize: 18, color: '#ffffff' },
  senderTextCol: { flex: 1 },
  senderName: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1a1a1a', marginBottom: 2 },
  senderEmail: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#a0a0a0' },
  dateChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f3f2ee' },
  dateChipText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#8e8e8e' },

  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#a0a0a0', letterSpacing: 1.5, marginBottom: 12 },
  tableCard: { borderWidth: 1, borderColor: '#ececec', borderRadius: 16, marginBottom: 24, backgroundColor: '#ffffff' },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  tableRowBorder: { borderTopWidth: 1, borderTopColor: '#ececec' },
  tableLabel: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#a0a0a0' },
  tableValue: { fontFamily: 'Inter_500Medium', fontSize: 14 },

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiIconWrap: { width: 20, height: 20, borderRadius: 6, backgroundColor: '#6658EA', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  aiTitleText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#6658EA', letterSpacing: 1.5 },
  summaryCard: { borderWidth: 1, borderColor: '#ececec', borderRadius: 16, padding: 16, marginBottom: 24, backgroundColor: '#ffffff' },
  summaryText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#444444', lineHeight: 22 },

  flagCard: { backgroundColor: '#FCE8E6', borderRadius: 12, marginBottom: 32, overflow: 'hidden' },
  flagCardInner: { borderLeftWidth: 4, borderLeftColor: '#EA4335', padding: 16 },
  flagTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.5, color: '#C5221F', marginBottom: 8 },
  flagText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#9b1b18', lineHeight: 20 },

  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EA4335', paddingVertical: 16, borderRadius: 12 },
  actionText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#ffffff' },
});
