import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { ICON_MAP } from '../data/recipes';
import { theme } from '../constants/theme';

const IngredientTile = ({ ingredientName, onPress, isCollected }) => {
  const { icon, color } = ICON_MAP[ingredientName] || { icon: '?', color: 'gray' };
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(bounceAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Floating animation
    // Animated.loop(
    //   Animated.sequence([
    //     Animated.timing(bounceAnim, {
    //       toValue: 1.05,
    //       duration: 1500,
    //       useNativeDriver: true,
    //     }),
    //     Animated.timing(bounceAnim, {
    //       toValue: 1,
    //       duration: 1500,
    //       useNativeDriver: true,
    //     }),
    //   ])
    // ).start();
  }, []);

  useEffect(() => {
    if (isCollected) {
      // Collected animation
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 2,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isCollected]);

  const handlePressIn = () => {
    ReactNativeHapticFeedback.trigger('impactLight');
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    ReactNativeHapticFeedback.trigger('impactMedium');
    onPress();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['0deg', '180deg', '360deg'],
  });

  // Color mapping
  const gradientColors = {
    green: theme.gradients.success,
    red: theme.gradients.primary,
    yellow: theme.gradients.accent,
    blue: theme.gradients.secondary,
    orange: theme.gradients.warm,
    purple: theme.gradients.purple,
    gray: ['#9E9E9E', '#757575'],
  };

  const gradient = gradientColors[color] || theme.gradients.primary;

  if (isCollected) {
    return <Animated.View style={[styles.tile, { transform: [{ scale: scaleAnim }] }]} />;
  }

  return (
    <Animated.View
      style={[
        styles.tileWrapper,
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, bounceAnim) },
            { rotate: rotation },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={styles.touchable}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tile}
        >
          <Text style={styles.icon}>{icon}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tileWrapper: {
    margin: theme.spacing.xs,
  },
  touchable: {
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
  },
  tile: {
    width: (theme.layout.screenWidth - theme.spacing['2xl'] * 2) / 4 - theme.spacing.xs * 2,
    height: (theme.layout.screenWidth - theme.spacing['2xl'] * 2) / 4 - theme.spacing.xs * 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  icon: {
    fontSize: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default IngredientTile;
