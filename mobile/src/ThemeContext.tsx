/**
 * ThemeContext.tsx
 * 
 * Manages the app's light/dark theme globally using React Context.
 * Any screen can call `useTheme()` to get the current colors and toggle function.
 * 
 * Light mode → warm beige background, dark text, muted red accent
 * Dark mode  → charcoal background, cream text, crimson red accent
 */

import React, { createContext, useContext, useState } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  colors: {
    bg: string;       // screen background color
    card: string;     // frosted glass card fill
    text: string;     // primary text
    subtext: string;  // secondary/muted text
    border: string;   // card borders
    blurTint: 'light' | 'dark'; // BlurView tint direction
    blurBg: string;   // blur container fallback bg
    accent: string;   // urgency red — badges, dots, buttons
    badge: string;    // subtle badge background
  };
}

// Light: clean beige with dark brown text — easy on the eyes
const lightColors = {
  bg: '#F0EBE3',
  card: 'rgba(255,255,255,0.6)',
  text: '#1A1A1A',
  subtext: '#6B6560',
  border: 'rgba(0,0,0,0.07)',
  blurTint: 'light' as const,
  blurBg: 'rgba(255,255,255,0.45)',
  accent: '#B83A2F',
  badge: 'rgba(184,58,47,0.1)',
};

// Dark: charcoal with cream text — classic dark mode
const darkColors = {
  bg: '#141414',
  card: 'rgba(50,50,55,0.7)',
  text: '#F0EDE8',
  subtext: '#8A8580',
  border: 'rgba(255,255,255,0.07)',
  blurTint: 'dark' as const,
  blurBg: 'rgba(40,40,44,0.6)',
  accent: '#C0392B',
  badge: 'rgba(192,57,43,0.15)',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light', toggleTheme: () => {}, colors: lightColors,
});

/**
 * Wrap the app root in <ThemeProvider> so every screen gets theme access.
 * State is kept here — toggling flips between light/dark palettes.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: theme === 'light' ? lightColors : darkColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Hook for screens to access current theme colors and toggle */
export const useTheme = () => useContext(ThemeContext);
