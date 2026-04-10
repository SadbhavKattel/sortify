import React from 'react';
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

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.bg, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.headerWrap}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.badgeBg }]}>
            <Feather name="arrow-left" size={20} color={colors.badgeText} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.greeting, { color: colors.subtext }]}>Information</Text>
            <Text style={[styles.title, { color: colors.text }]}>About Clairo</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.contentWrap}>
            <View style={styles.iconCircle}>
              <Feather name="mail" size={32} color="#ffffff" />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>Clairo</Text>
            <Text style={[styles.appVersion, { color: colors.subtext }]}>Version 1.0.0 (Build 42)</Text>
            
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.desc, { color: colors.text }]}>
                Clairo is a minimalist, AI-powered smart inbox designed to separate critical actions from daily noise.
              </Text>
            </View>
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
  contentWrap: { alignItems: 'center', marginTop: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  appName: { fontFamily: 'Inter_700Bold', fontSize: 28, marginBottom: 8 },
  appVersion: { fontFamily: 'Inter_500Medium', fontSize: 14, marginBottom: 40 },
  
  card: { width: '100%', padding: 24, borderWidth: 1, borderRadius: 24 },
  desc: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, textAlign: 'center' }
});
