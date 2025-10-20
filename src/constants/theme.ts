import { COLORS } from './colors';
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const theme = {
  colors: {
    // Primary palette with depth
    primary: COLORS.primary,
    primaryDark: '#D64933',
    primaryLight: '#FF7961',
    
    // Accent colors
    accent: COLORS.accent,
    accentDark: '#E6A800',
    accentLight: '#FFD966',
    
    // Secondary palette
    secondary: '#4ECDC4',
    secondaryDark: '#45B8B0',
    secondaryLight: '#7FE5DE',
    
    // Success, warning, error
    success: '#4CAF50',
    successLight: '#81C784',
    warning: '#FF9800',
    warningLight: '#FFB74D',
    error: '#F44336',
    errorLight: '#E57373',
    
    // Neutral palette
    background: COLORS.white,
    backgroundDark: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceDark: '#FAFAFA',
    
    text: COLORS.black,
    textSecondary: '#757575',
    textTertiary: '#BDBDBD',
    border: COLORS.lightGrey,
    borderLight: '#E0E0E0',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    
    // Transparent variations
    primaryTransparent: 'rgba(244, 67, 54, 0.1)',
    accentTransparent: 'rgba(255, 193, 7, 0.1)',
    secondaryTransparent: 'rgba(78, 205, 196, 0.1)',
  },
  
  gradients: {
    primary: ['#FF6B6B', '#FF8E53'],
    primaryReverse: ['#FF8E53', '#FF6B6B'],
    accent: ['#FFD93D', '#FFA500'],
    secondary: ['#4FACFE', '#00F2FE'],
    success: ['#56AB2F', '#A8E063'],
    sunset: ['#FF512F', '#DD2476'],
    ocean: ['#2E3192', '#1BFFFF'],
    purple: ['#A770EF', '#CF8BF3', '#FDB99B'],
    warm: ['#FF9A56', '#FFD39A'],
    cool: ['#667EEA', '#764BA2'],
    background: ['#ECE9E6', '#FFFFFF'],
  },
  
  typography: {
    // Font families
    fontFamily: {
      primary: 'BalsamiqSans-Bold',
      secondary: 'BalsamiqSans-Regular',
      body: 'Inter-Regular',
      bodyBold: 'Inter-Bold',
    },
    
    // Font sizes
    fontSize: {
      xs: 10,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
      '5xl': 40,
      '6xl': 48,
    },
    
    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
  },
  
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
  },
  
  shadows: {
    none: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12,
    },
    colored: {
      primary: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
      accent: {
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
    },
  },
  
  animation: {
    duration: {
      fast: 150,
      normal: 250,
      slow: 350,
      slower: 500,
    },
    easing: {
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  layout: {
    screenWidth: width,
    screenHeight: height,
    isSmallDevice: width < 375,
    isMediumDevice: width >= 375 && width < 414,
    isLargeDevice: width >= 414,
  },
};

export type Theme = typeof theme;

