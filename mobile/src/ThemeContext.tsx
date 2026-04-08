import React, { createContext, useContext, useState } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  colors: {
    bg: string;
    card: string;
    cardSecondary: string;
    text: string;
    subtext: string;
    border: string;
    accent: string;
    heroBg: string;
    heroText: string;
    heroSub: string;
    badgeBg: string;
    badgeText: string;
    blurTint: 'light' | 'dark' | 'default';
    blurBg: string;
  };
}

const lightColors: ThemeContextType['colors'] = {
  bg: '#ffffff',
  card: '#ffffff',
  cardSecondary: '#fdfdfd',
  text: '#1a1a1a',
  subtext: '#8e8e8e',
  border: '#f0f0f0',
  accent: '#000000',
  heroBg: '#121212',
  heroText: '#ffffff',
  heroSub: '#aaaaaa',
  badgeBg: '#f5f5f5',
  badgeText: '#555555',
  blurTint: 'light',
  blurBg: 'rgba(255,255,255,0.7)',
};

const darkColors: ThemeContextType['colors'] = {
  bg: '#000000',
  card: '#121212',
  cardSecondary: '#1a1a1a',
  text: '#ffffff',
  subtext: '#aaaaaa',
  border: '#2a2a2a',
  accent: '#ffffff',
  heroBg: '#1e1e1e',
  heroText: '#ffffff',
  heroSub: '#cccccc',
  badgeBg: '#2a2a2a',
  badgeText: '#dddddd',
  blurTint: 'dark',
  blurBg: 'rgba(0,0,0,0.7)',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light', 
  toggleTheme: () => {}, 
  colors: lightColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: theme === 'light' ? lightColors : darkColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
