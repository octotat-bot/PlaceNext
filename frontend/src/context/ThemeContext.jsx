// src/context/ThemeContext.jsx
// Per-user theme system — 6 themes, keyed by userId in localStorage

import { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, DEFAULT_THEME_ID, getThemeById } from '../themes/themes';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

// Apply a theme's CSS variables to document :root instantly
function applyTheme(theme) {
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
  root.setAttribute('data-theme', theme.id);
  // Keep dark class in sync for any legacy selectors
  if (theme.vars['--color-background-primary'] <= '#444444') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children }) {
  const { user } = useAuth();

  const storageKey = user ? `theme_${user._id}` : 'theme_guest';

  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem(storageKey) ?? DEFAULT_THEME_ID;
  });

  // Apply CSS vars whenever themeId changes
  useEffect(() => {
    const theme = getThemeById(themeId);
    applyTheme(theme);
  }, [themeId]);

  // When user logs in/out, reload their saved theme
  useEffect(() => {
    if (!user) {
      // Logged out — apply default so login page looks clean
      applyTheme(getThemeById(DEFAULT_THEME_ID));
      setThemeId(DEFAULT_THEME_ID);
      return;
    }
    const saved = localStorage.getItem(`theme_${user._id}`) ?? DEFAULT_THEME_ID;
    setThemeId(saved);
  }, [user?._id]);

  const changeTheme = (id) => {
    setThemeId(id);
    localStorage.setItem(storageKey, id);
    applyTheme(getThemeById(id));
  };

  const currentTheme = getThemeById(themeId);

  return (
    <ThemeContext.Provider value={{ themeId, currentTheme, changeTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};

export default ThemeContext;
