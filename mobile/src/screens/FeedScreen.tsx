import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, NativeModules, ScrollView, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Feather } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useTheme } from '../ThemeContext';
import { analyzeEmailImportance, analyzeEmailDeadline, analyzeEmailAlert } from '../utils/emailAnalyzer';
import { processEmailsForAI } from '../utils/aiScoring';
import { createGoogleCalendarEvent } from '../utils/calendarService';

export default function FeedScreen({ navigation }: any) {
  const { colors, theme } = useTheme();
  const [emails, setEmails] = useState<any[]>([]);
  const [readEmailIds, setReadEmailIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Important');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEmails();
    setRefreshing(false);
  };
  
  const [fontsLoaded] = useFonts({ 
    Inter_400Regular, 
    Inter_500Medium, 
    Inter_600SemiBold, 
    Inter_700Bold 
  });

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const storedIdsStr = await AsyncStorage.getItem('readEmailIds');
      const storedReadIds = storedIdsStr ? new Set<string>(JSON.parse(storedIdsStr)) : new Set<string>();
      setReadEmailIds(storedReadIds);

      let accessToken;
      try {
        const tokens = await GoogleSignin.getTokens();
        accessToken = tokens.accessToken;
      } catch(e) {
        await GoogleSignin.signInSilently();
        const tokens = await GoogleSignin.getTokens();
        accessToken = tokens.accessToken;
      }
      
      const query = encodeURIComponent('in:inbox -category:promotions -category:social');
      const listResponse = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=${query}`, 
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const listData = await listResponse.json();
      
      if (!listData.messages) {
        setEmails([]);
        setLoading(false);
        return;
      }

      // DISMISS LOADING SPINNER IMMEDIATELY
      // The user now lands on the page instantly. The emails will pop in as they load.
      setLoading(false);

      const syncWidget = (emailsToSync: any[]) => {
        try {
          const highEmails = emailsToSync.filter((e: any) => e.priorityLevel === 'High');
          const widgetEmails = [...highEmails].sort((a, b) => {
            if (b.aiScore !== a.aiScore) return b.aiScore - a.aiScore;
            if (a.urgencyReasons === 'Alert' && b.urgencyReasons !== 'Alert') return -1;
            if (b.urgencyReasons === 'Alert' && a.urgencyReasons !== 'Alert') return 1;
            if (a.urgencyReasons === 'Deadline' && b.urgencyReasons !== 'Deadline') return -1;
            if (b.urgencyReasons === 'Deadline' && a.urgencyReasons !== 'Deadline') return 1;
            return 0;
          });
          NativeModules.WidgetData?.setWidgetData(JSON.stringify(widgetEmails.slice(0, 3)));
        } catch (e) {
          console.log("Failed to sync widgets", e);
        }
      };

      const fetchEmailDetails = async (msg: any) => {
        try {
          const detailResp = await fetch(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const detailData = await detailResp.json();
          
          let subject = '';
          let senderName = '';
          let senderEmail = '';
          let dateHeader = '';
          
          if (detailData.payload && detailData.payload.headers) {
            detailData.payload.headers.forEach((h: any) => {
              if (h.name === 'Subject') subject = h.value;
              if (h.name === 'From') {
                const fromValue = h.value;
                senderName = fromValue.split('<')[0].replace(/"/g, '').trim();
                const emailMatch = fromValue.match(/<([^>]+)>/);
                senderEmail = emailMatch ? emailMatch[1] : fromValue;
                if (!senderName) senderName = senderEmail;
              }
              if (h.name === 'Date') dateHeader = h.value;
            });
          }
          
          const impResult = analyzeEmailImportance(subject, senderName, detailData.snippet || '');
          const deadlineResult = analyzeEmailDeadline(subject, detailData.snippet || '');
          const alertResult = analyzeEmailAlert(subject, detailData.snippet || '');
          
          let urgencyReasons = 'Important';
          let priorityLevel = 'Med';
          
          if (alertResult.surface) {
            urgencyReasons = 'Alert';
            priorityLevel = alertResult.priority === 'high' ? 'High' : 'Medium';
          } else if (deadlineResult.surface) {
            urgencyReasons = 'Deadline';
            priorityLevel = deadlineResult.priority === 'high' ? 'High' : (deadlineResult.score > 30 ? 'Due' : 'Low');
          } else if (impResult.surface) {
            urgencyReasons = 'Important';
            priorityLevel = impResult.priority === 'high' ? 'High' : 'Med';
          }

          const heuristicSurface = alertResult.surface || deadlineResult.surface || impResult.surface;
          let receivedAt = dateHeader ? dateHeader.split(' ').slice(1, 4).join(' ') : 'Unknown';

          return {
            id: msg.id,
            subject: subject || 'No Subject',
            senderName: senderName || 'Unknown Sender',
            urgencyReasons,
            priorityLevel,
            snippet: detailData.snippet || '',
            receivedAt,
            isUnread: !storedReadIds.has(msg.id.toString()),
            senderEmail,
            heuristicSurface
          };
        } catch (e) {
          return null;
        }
      };

      // Fetch all details in the background (Non-blocking)
      Promise.all(listData.messages.map(fetchEmailDetails)).then((detailResults) => {
        const allFetchedEmails = detailResults.filter(Boolean) as any[];
        
        setEmails(allFetchedEmails.filter((e: any) => e.heuristicSurface));
        syncWidget(allFetchedEmails);

        // Feature 1 — AI Email Importance Scoring (Run in background)
        processEmailsForAI(allFetchedEmails, (scoredEmailsProgress) => {
          setEmails(scoredEmailsProgress.filter((e: any) => e.heuristicSurface));
          syncWidget(scoredEmailsProgress);
        }).then(async (scoredEmails) => {
          setEmails(scoredEmails.filter((e: any) => e.heuristicSurface));
          for (const email of scoredEmails) {
            if (email.aiScore === 5 && email.aiEvent) {
              await createGoogleCalendarEvent(accessToken, email.id, email.aiEvent);
            }
          }
          syncWidget(scoredEmails);
        }).catch(err => console.log('Background AI processing error:', err));
      });
      
    } catch (error: any) {
      console.log('Error fetching real emails:', error);
      setEmails([
        { 
          id: 1, 
          subject: 'Local Error: ' + (error.message || 'Unknown Exception'), 
          senderName: 'System Diagnostic', 
          urgencyReasons: 'Important', 
          priorityLevel: 'High', 
          snippet: String(error) + ' | Check console.', 
          receivedAt: 'Just Now', 
          isUnread: false 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmails(); }, []);
  if (!fontsLoaded) return null;

  const filteredEmails = emails.filter(e => {
    let matchTab = true;
    if (activeTab !== 'All') {
      const cat = e.urgencyReasons?.toLowerCase() || '';
      if (activeTab === 'Important') matchTab = cat.includes('important');
      else if (activeTab === 'Deadlines') matchTab = cat.includes('deadline');
      else if (activeTab === 'Alerts') matchTab = cat.includes('alert');
    }
    
    let matchSearch = true;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      matchSearch = 
        e.subject?.toLowerCase().includes(q) ||
        e.senderName?.toLowerCase().includes(q) ||
        e.snippet?.toLowerCase().includes(q);
    }
    
    return matchTab && matchSearch;
  });

  const tabs = ['Important', 'Deadlines', 'Alerts', 'Calendar'];

  const getMarkedDates = () => {
    const marks: any = {};
    emails.forEach(email => {
      if (email.aiEvent && email.aiEvent.date) {
        marks[email.aiEvent.date] = { 
          marked: true, 
          dotColor: '#EA4335', // Red dot to clearly indicate an event/deadline
        };
      }
    });
    
    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: colors.text,
        selectedTextColor: colors.bg
      };
    }
    return marks;
  };

  const getColors = (urgencyReason: string) => {
    if (urgencyReason === 'Alert') return { dot: '#EA4335', pillBg: '#FCE8E6', pillText: '#C5221F' };
    if (urgencyReason === 'Deadline') return { dot: '#FBBC04', pillBg: '#FEF7E0', pillText: '#EA8600' };
    return { dot: '#6658EA', pillBg: '#EFEAFC', pillText: '#5944D7' };
  };

  const handlePressEmail = async (item: any) => {
    setEmails(prev => prev.map(e => e.id === item.id ? { ...e, isUnread: false } : e));
    
    try {
      const newReadIds = new Set(readEmailIds);
      newReadIds.add(item.id.toString());
      setReadEmailIds(newReadIds);
      await AsyncStorage.setItem('readEmailIds', JSON.stringify(Array.from(newReadIds)));
    } catch (e) {}

    navigation.navigate('Detail', { email: item });
  };

  const renderItem = ({ item }: any) => {
    const c = getColors(item.urgencyReasons);
    const isUnread = item.isUnread;

    return (
      <TouchableOpacity activeOpacity={0.8} onPress={() => handlePressEmail(item)} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.dot, marginRight: 8, opacity: isUnread ? 1 : 0.5 }} />
            <Text style={[styles.senderText, { color: isUnread ? '#1a1a1a' : '#8e8e8e', fontFamily: isUnread ? 'Inter_500Medium' : 'Inter_400Regular' }]} numberOfLines={1}>
              {item.senderName} <Text style={{color: '#ccc'}}>·</Text> {item.urgencyReasons}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.priorityPill, { backgroundColor: c.pillBg, opacity: isUnread ? 1 : 0.7 }]}>
              <Text style={[styles.priorityPillText, { color: c.pillText }]}>{item.priorityLevel}</Text>
            </View>
            <Text style={[styles.timeText, { color: '#a0a0a0', marginLeft: 12 }]}>{item.receivedAt}</Text>
          </View>
        </View>
        <Text style={[styles.subjectText, { color: isUnread ? '#1a1a1a' : '#8e8e8e', fontFamily: isUnread ? 'Inter_500Medium' : 'Inter_400Regular' }]} numberOfLines={1}>{item.subject}</Text>
        {!!item.snippet && (
          <Text style={[styles.snippetText, { color: '#a0a0a0', opacity: isUnread ? 1 : 0.8 }]} numberOfLines={1}>{item.snippet}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.bg, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.subtext }]}>
              {new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>Priority Inbox</Text>
          </View>
          <TouchableOpacity style={[styles.iconCircle, { backgroundColor: colors.badgeBg }]}>
            <Feather name="bell" size={20} color={colors.badgeText} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: colors.badgeBg }]}>
            <Feather name="search" size={18} color={colors.subtext} />
            <TextInput 
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search important emails"
              placeholderTextColor={colors.subtext}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Dashboard Numbers */}
        <View style={styles.dashboard}>
          <View style={styles.dashBlock}>
            <View style={styles.dashTopRow}>
               <View style={[styles.dashIcon, { backgroundColor: '#EFEAFC' }]}>
                 <Feather name="check-square" size={16} color="#6658EA" />
               </View>
               <Text style={styles.dashCount}>{emails.filter(e => e.urgencyReasons === 'Important' && e.isUnread).length || 0}</Text>
            </View>
            <Text style={styles.dashLabel}>NEED ACTION</Text>
          </View>
          <View style={styles.dashBlock}>
            <View style={styles.dashTopRow}>
               <View style={[styles.dashIcon, { backgroundColor: '#FCE8E6' }]}>
                 <Feather name="clock" size={16} color="#ea4335" />
               </View>
               <Text style={styles.dashCount}>{emails.filter(e => e.urgencyReasons === 'Deadline' && e.isUnread).length || 0}</Text>
            </View>
            <Text style={styles.dashLabel}>DEADLINES</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.chipRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContent}>
            {tabs.map(tab => {
              const active = activeTab === tab;
              return (
                <TouchableOpacity 
                  key={tab} 
                  onPress={() => setActiveTab(tab)} 
                  style={[styles.chip, { backgroundColor: active ? colors.text : colors.bg, borderColor: colors.border }]}
                >
                  <Text style={[styles.chipText, { color: active ? colors.bg : colors.text }]}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Email List */}
        {loading && emails.length === 0 ? (
          <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.text} /></View>
        ) : activeTab === 'Calendar' ? (
          <View style={{ flex: 1 }}>
            <Calendar
              minDate={new Date().toISOString().split('T')[0]}
              maxDate={new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0]}
              onDayPress={(day: any) => setSelectedDate(day.dateString)}
              markedDates={getMarkedDates()}
              theme={{
                backgroundColor: colors.bg,
                calendarBackground: colors.bg,
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: colors.text,
                selectedDayTextColor: colors.bg,
                todayTextColor: '#6658EA',
                dayTextColor: '#1a1a1a',
                textDisabledColor: '#d9e1e8',
                dotColor: '#EA4335',
                selectedDotColor: '#ffffff',
                arrowColor: '#6658EA',
                disabledArrowColor: '#d9e1e8',
                monthTextColor: colors.text,
                indicatorColor: 'blue',
                textDayFontFamily: 'Inter_400Regular',
                textMonthFontFamily: 'Inter_600SemiBold',
                textDayHeaderFontFamily: 'Inter_500Medium',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 12
              }}
            />
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, marginHorizontal: 24, marginVertical: 16, color: colors.subtext }}>
                EVENTS ON {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </Text>
              <FlatList 
                data={emails.filter(e => e.aiEvent && e.aiEvent.date === selectedDate)} 
                renderItem={renderItem} 
                keyExtractor={item => item.id.toString()} 
                contentContainerStyle={styles.listContent} 
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: colors.subtext, fontFamily: 'Inter_400Regular' }}>No events scheduled for this day.</Text>}
              />
            </View>
          </View>
        ) : (
          <FlatList 
            data={filteredEmails} 
            renderItem={renderItem} 
            keyExtractor={item => item.id.toString()} 
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />} 
            contentContainerStyle={styles.listContent} 
            showsVerticalScrollIndicator={false} 
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#F9F9F9' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'center',
    marginBottom: 20
  },
  greeting: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#8e8e8e', marginBottom: 2 },
  title: { fontFamily: 'Inter_500Medium', fontSize: 32, color: '#1a1a1a', letterSpacing: -0.5 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F2EE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F2EE',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    gap: 12
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#1a1a1a'
  },

  dashboard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  dashBlock: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  dashTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dashIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashLabel: { 
    fontFamily: 'Inter_500Medium', 
    fontSize: 11, 
    color: '#b3b3b3', 
    letterSpacing: 1.5,
  },
  dashCount: { 
    fontFamily: 'Inter_700Bold', 
    fontSize: 32, 
    color: '#0f0f0f' 
  },

  chipRow: { height: 36, marginBottom: 16 },
  chipContent: { paddingHorizontal: 24, gap: 8 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ececec',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#0f0f0f',
    borderColor: '#0f0f0f',
  },
  chipText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#666666' },
  chipTextActive: { color: '#ffffff' },

  listContent: { paddingBottom: 20 },
  card: {
    backgroundColor: '#ffffff',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  senderText: { fontSize: 13 },
  timeText: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  priorityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityPillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  subjectText: { fontSize: 16, marginVertical: 2, letterSpacing: -0.2 },
  snippetText: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
