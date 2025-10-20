import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';

interface StatusBarConfig {
  barStyle?: 'default' | 'light-content' | 'dark-content';
  backgroundColor?: string;
  translucent?: boolean;
  hidden?: boolean;
  animated?: boolean;
}

/**
 * Custom hook to manage Android status bar and navigation bar elegantly
 * @param config - StatusBar configuration
 */
export const useAndroidBars = (config: StatusBarConfig = {}) => {
  const {
    barStyle = 'light-content',
    backgroundColor = '#FF6B6B',
    translucent = false,
    hidden = false,
    animated = true,
  } = config;

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Set status bar style
      StatusBar.setBarStyle(barStyle, animated);
      
      // Set status bar background color (Android only)
      StatusBar.setBackgroundColor(backgroundColor, animated);
      
      // Set translucent mode
      StatusBar.setTranslucent(translucent);
      
      // Set hidden state
      StatusBar.setHidden(hidden, animated ? 'fade' : 'none');
    }
  }, [barStyle, backgroundColor, translucent, hidden, animated]);
};

/**
 * Preset configurations for different screen types
 */
export const AndroidBarPresets = {
  // Main menu with bright colors
  mainMenu: {
    barStyle: 'light-content' as const,
    backgroundColor: '#FF6B6B',
    translucent: false,
  },
  
  // Game screen - immersive without status bar
  gameImmersive: {
    barStyle: 'light-content' as const,
    backgroundColor: 'transparent',
    translucent: true,
    hidden: false,
  },
  
  // Level select with secondary color
  levelSelect: {
    barStyle: 'light-content' as const,
    backgroundColor: '#4ECDC4',
    translucent: false,
  },
  
  // Recipe book with accent color
  recipeBook: {
    barStyle: 'dark-content' as const,
    backgroundColor: '#FFE66D',
    translucent: false,
  },
  
  // Settings with clean white
  settings: {
    barStyle: 'dark-content' as const,
    backgroundColor: '#FFFFFF',
    translucent: false,
  },
  
  // Loading screen
  loading: {
    barStyle: 'light-content' as const,
    backgroundColor: '#FF6B6B',
    translucent: false,
  },
};

/**
 * Helper function to set navigation bar color (Android API 27+)
 * Note: This requires react-native-system-navigation-bar or similar library
 * For now, this is handled via styles.xml
 */
export const setNavigationBarColor = (color: string, lightButtons: boolean = false) => {
  if (Platform.OS === 'android') {
    // This would require react-native-system-navigation-bar
    // For now, navigation bar color is set in styles.xml
    console.log(`Navigation bar color would be set to: ${color}`);
  }
};

export default useAndroidBars;
