import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, NativeModules, ScrollView, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Feather } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useTheme } from '../ThemeContext';

export default function FeedScreen({ navigation }: any) {
  const { colors, theme } = useTheme();
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [fontsLoaded] = useFonts({ 
    Inter_400Regular, 
    Inter_500Medium, 
    Inter_600SemiBold, 
    Inter_700Bold 
  });

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const { accessToken } = await GoogleSignin.getTokens();
      
      const query = encodeURIComponent('in:inbox category:primary is:important -category:promotions -category:social');
      const listResponse = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=25&q=${query}`, 
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const listData = await listResponse.json();
      
      if (!listData.messages) {
        setEmails([]);
        setLoading(false);
        return;
      }

      const emailPromises = listData.messages.map(async (msg: any) => {
        const detailResp = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const detailData = await detailResp.json();
        
        let subject = '';
        let senderName = '';
        let dateHeader = '';
        
        if (detailData.payload && detailData.payload.headers) {
          detailData.payload.headers.forEach((h: any) => {
            if (h.name === 'Subject') subject = h.value;
            if (h.name === 'From') senderName = h.value.split('<')[0].trim();
            if (h.name === 'Date') dateHeader = h.value;
          });
        }
        
        const subjLower = subject.toLowerCase();
        const snippetLower = (detailData.snippet || '').toLowerCase();
        const textToAnalyze = subjLower + ' ' + snippetLower;
        
        const isAlert = textToAnalyze.match(/(alert|security|warning|fraud|breach|login|sign-in|unusual|failed|unauthorized)/i);
        const isDeadline = textToAnalyze.match(/(deadline|due|reminder|action required|closing|ending|submit|expires|upcoming)/i);
        
        let urgencyReasons = 'Important';
        let priorityLevel = 'High';
        
        if (isAlert) {
          urgencyReasons = 'Alert';
          priorityLevel = 'High';
        } else if (isDeadline) {
          urgencyReasons = 'Deadline';
          priorityLevel = 'Due';
        } else {
          priorityLevel = 'Med';
          if (subjLower.includes('google')) priorityLevel = 'High';
          if (subjLower.includes('coms')) priorityLevel = 'High';
        }

        let receivedAt = dateHeader ? dateHeader.split(' ').slice(1, 4).join(' ') : 'Unknown';

        return {
          id: msg.id,
          subject: subject || 'No Subject',
          senderName: senderName || 'Unknown Sender',
          urgencyReasons,
          priorityLevel,
          snippet: detailData.snippet || '',
          receivedAt,
          isUnread: detailData.labelIds ? detailData.labelIds.includes('UNREAD') : false
        };
      });

      const fetchedEmails = await Promise.all(emailPromises);
      setEmails(fetchedEmails);

      try {
        NativeModules.WidgetData?.setWidgetData(JSON.stringify(fetchedEmails.slice(0, 5)));
      } catch (e) {
        console.log("Failed to sync widgets", e);
      }
      
    } catch (error) {
      console.log('Error fetching real emails, falling back to dummy data', error);
      setEmails([
        { id: 1, subject: 'Application update', senderName: 'Google Careers', urgencyReasons: 'Important', priorityLevel: 'High', snippet: 'Your application has moved to the next stage.', receivedAt: '10:24', isUnread: false },
        { id: 2, subject: 'Document reminder', senderName: 'UTA Financial Aid', urgencyReasons: 'Deadline', priorityLevel: 'High', snippet: 'Submit your missing document before Friday.', receivedAt: '09:10', isUnread: true },
        { id: 3, subject: 'Security alert on your account', senderName: 'GitHub', urgencyReasons: 'Alert', priorityLevel: 'Medium', snippet: 'A new sign-in was detected from a new ...', receivedAt: 'Yesterday', isUnread: true },
        { id: 4, subject: 'Return window closes soon', senderName: 'Amazon', urgencyReasons: 'Reminder', priorityLevel: 'Low', snippet: '', receivedAt: 'Yesterday', isUnread: false },
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

  const tabs = ['All', 'Important', 'Deadlines', 'Alerts'];

  const getColors = (urgencyReason: string) => {
    if (urgencyReason === 'Alert') return { dot: '#EA4335', pillBg: '#FCE8E6', pillText: '#C5221F' };
    if (urgencyReason === 'Deadline') return { dot: '#FBBC04', pillBg: '#FEF7E0', pillText: '#EA8600' };
    return { dot: '#6658EA', pillBg: '#EFEAFC', pillText: '#5944D7' };
  };

  const handlePressEmail = (item: any) => {
    setEmails(prev => prev.map(e => e.id === item.id ? { ...e, isUnread: false } : e));
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
            <Text style={[styles.greeting, { color: colors.subtext }]}>Tuesday, Apr 2</Text>
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
            <Text style={styles.dashCount}>4</Text>
            <Text style={styles.dashLabel}>Need action</Text>
          </View>
          <View style={styles.dashBlock}>
            <Text style={styles.dashCount}>2</Text>
            <Text style={styles.dashLabel}>Deadlines</Text>
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
        ) : (
          <FlatList 
            data={filteredEmails} 
            renderItem={renderItem} 
            keyExtractor={item => item.id.toString()} 
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchEmails} tintColor={colors.text} />} 
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  dashLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#a0a0a0' },
  dashCount: { fontFamily: 'Inter_500Medium', fontSize: 24, color: '#1a1a1a', marginBottom: 4 },

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
