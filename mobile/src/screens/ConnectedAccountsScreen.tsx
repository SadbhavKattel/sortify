import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useTheme } from '../ThemeContext';

export default function ConnectedAccountsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await GoogleSignin.getCurrentUser();
        setUserInfo(currentUser?.user);
      } catch(e) {}
    };
    fetchUser();
  }, []);

  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  if (!fontsLoaded) return null;

  const RowItem = ({ icon, title, subtitle, rightElement }: any) => (
    <TouchableOpacity activeOpacity={0.7} style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconCircle, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
          <Feather name={icon} size={18} color={colors.subtext} />
        </View>
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>{subtitle}</Text>
        </View>
      </View>
      {rightElement}
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
            <Text style={[styles.greeting, { color: colors.subtext }]}>Email services</Text>
            <Text style={[styles.title, { color: colors.text }]}>Connected Accounts</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.list}>
            <RowItem 
              icon="mail" 
              title="Google Account" 
              subtitle={userInfo?.email || "Loading Google Profile..."} 
              rightElement={<View style={[styles.activePill, { backgroundColor: colors.text }]}><Text style={[styles.activePillText, { color: colors.bg }]}>Active</Text></View>} 
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1 },
  headerWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, marginBottom: 24 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  greeting: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#8e8e8e', marginBottom: 2 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 22, color: '#1a1a1a', letterSpacing: -0.5 },
  
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  list: { gap: 12 },
  rowCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f0f0f0', borderRadius: 20, padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flexShrink: 1 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fdfdfd', borderWidth: 1, borderColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1a1a1a', marginBottom: 2 },
  rowSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8e8e8e' },
  rowValue: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#8e8e8e' },
  activePill: { backgroundColor: '#000000', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  activePillText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#ffffff' }
});
