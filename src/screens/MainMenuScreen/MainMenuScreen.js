import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../components/CustomButton';
import { theme } from '../../constants/theme';
import { useAndroidBars, AndroidBarPresets } from '../../utils/useAndroidBars';

const MainMenuScreen = () => {
  const navigation = useNavigation();
  
  // Manage Android status bar
  useAndroidBars(AndroidBarPresets.mainMenu);
  
  // Animation values
  const titleScale = new Animated.Value(0);
  const titleRotate = new Animated.Value(0);
  const button1Opacity = new Animated.Value(0);
  const button2Opacity = new Animated.Value(0);
  const button3Opacity = new Animated.Value(0);
  const floatingAnim = new Animated.Value(0);
  
  useEffect(() => {
    // Title entrance animation
    Animated.sequence([
      Animated.spring(titleScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(titleRotate, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Staggered button animations
    Animated.stagger(150, [
      Animated.spring(button1Opacity, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(button2Opacity, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(button3Opacity, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Floating animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const titleRotation = titleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '0deg'],
  });
  
  const floatingTranslateY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={theme.gradients.warm}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative circles */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
      
      <View style={styles.content}>
        {/* Animated title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              transform: [
                { scale: titleScale },
                { rotate: titleRotation },
                { translateY: floatingTranslateY },
              ],
            },
          ]}
        >
          <Text style={styles.titleEmoji}>👨‍🍳</Text>
          <Text style={styles.title}>Chef's Quest</Text>
          <Text style={styles.subtitle}>Master the Kitchen!</Text>
        </Animated.View>
        
        {/* Animated buttons */}
        <View style={styles.buttonContainer}>
          <Animated.View style={{ opacity: button1Opacity, width: '100%' }}>
            <CustomButton
              title="🎮 Play"
              onPress={() => navigation.navigate('LevelSelect')}
              style={styles.playButton}
            />
          </Animated.View>
          
          <Animated.View style={{ opacity: button2Opacity, width: '100%' }}>
            <CustomButton
              title="📖 My Recipe Book"
              onPress={() => navigation.navigate('RecipeBook')}
            />
          </Animated.View>
          
          <Animated.View style={{ opacity: button3Opacity, width: '100%' }}>
            <CustomButton
              title="⚙️ Settings"
              onPress={() => navigation.navigate('Settings')}
            />
          </Animated.View>
        </View>
      </View>
    </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    bottom: 100,
    left: -40,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: '40%',
    right: 30,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['5xl'],
  },
  titleEmoji: {
    fontSize: 80,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize['6xl'],
    fontFamily: theme.typography.fontFamily.primary,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.secondary,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: theme.colors.success,
    ...theme.shadows.lg,
  },
});

export default MainMenuScreen;
