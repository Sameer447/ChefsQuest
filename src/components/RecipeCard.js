import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

const RecipeCard = ({ recipe, onPress, isLocked, starsEarned }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const lockShake = useRef(new Animated.Value(0)).current;
  const starRotate = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Shimmer effect for unlocked cards
    if (!isLocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow pulse for perfect 3-star recipes
      if (starsEarned === 3) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: false,
            }),
          ])
        ).start();
      }

      // Star rotation animation
      if (starsEarned > 0) {
        Animated.loop(
          Animated.timing(starRotate, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        ).start();
      }
    }
  }, [isLocked, starsEarned]);

  const handlePressIn = () => {
    if (!isLocked) {
      ReactNativeHapticFeedback.trigger('impactLight');
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }).start();
    } else {
      ReactNativeHapticFeedback.trigger('notificationWarning');
      Animated.sequence([
        Animated.timing(lockShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(lockShake, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(lockShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(lockShake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (!isLocked) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (!isLocked) {
      ReactNativeHapticFeedback.trigger('impactMedium');
      onPress();
    }
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 150],
  });

  const starRotation = starRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  // Enhanced gradient colors based on tier and completion
  const getGradientColors = () => {
    if (isLocked) return ['#4A5568', '#2D3748'];
    
    const tier = recipe.tier || 1;
    
    if (starsEarned === 3) {
      // Perfect - Gold gradient
      return ['#FFD700', '#FFA500', '#FF8C00'];
    } else if (starsEarned > 0) {
      // In progress - Silver gradient
      return ['#E8E8E8', '#C0C0C0', '#A8A8A8'];
    } else {
      // Not started - Tier-based colors
      switch (tier) {
        case 1: return ['#10B981', '#059669', '#047857']; // Easy - Green
        case 2: return ['#3B82F6', '#2563EB', '#1D4ED8']; // Basic - Blue
        case 3: return ['#8B5CF6', '#7C3AED', '#6D28D9']; // Standard - Purple
        case 4: return ['#EF4444', '#DC2626', '#B91C1C']; // Advanced - Red
        case 5: return ['#1F2937', '#111827', '#000000']; // Hard - Dark
        default: return theme.gradients.primary;
      }
    }
  };

  // Difficulty indicator based on tier
  const getDifficultyInfo = () => {
    const tier = recipe.tier || 1;
    const difficulties = {
      1: { label: 'Easy', color: '#10B981', dots: 1 },
      2: { label: 'Basic', color: '#3B82F6', dots: 2 },
      3: { label: 'Standard', color: '#8B5CF6', dots: 3 },
      4: { label: 'Advanced', color: '#EF4444', dots: 4 },
      5: { label: 'Hard', color: '#DC2626', dots: 5 },
    };
    return difficulties[tier] || difficulties[1];
  };

  const difficulty = getDifficultyInfo();

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [
            { scale: scaleAnim },
            { translateX: isLocked ? lockShake : 0 },
          ],
        },
      ]}
    >
      {/* Glow effect for perfect recipes */}
      {starsEarned === 3 && !isLocked && (
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowOpacity,
            },
          ]}
        />
      )}

      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isLocked}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Shimmer effect */}
          {!isLocked && (
            <Animated.View
              style={[
                styles.shimmer,
                {
                  transform: [{ translateX: shimmerTranslate }],
                },
              ]}
            >
              <LinearGradient
                colors={['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
          )}

          {/* Decorative pattern */}
          <View style={styles.pattern}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
          </View>

          {/* Lock overlay */}
          {isLocked && (
            <View style={styles.lockOverlay}>
              <View style={styles.lockIconContainer}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
              <Text style={styles.lockText}>Unlock at</Text>
              <Text style={styles.lockStars}>{recipe.unlockedAt} ⭐</Text>
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {/* Tier badge */}
            {!isLocked && (
              <View style={[styles.tierBadge, { backgroundColor: difficulty.color }]}>
                <Text style={styles.tierText}>{difficulty.label}</Text>
              </View>
            )}

            {/* Recipe emoji/image */}
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{recipe.emoji || recipe.name.charAt(0)}</Text>
              {starsEarned === 3 && (
                <Animated.View
                  style={[
                    styles.perfectBadge,
                    {
                      transform: [{ rotate: starRotation }],
                    },
                  ]}
                >
                  <Text style={styles.perfectText}>✨</Text>
                </Animated.View>
              )}
            </View>

            {/* Recipe name */}
            <Text style={styles.name} numberOfLines={2}>
              {recipe.name}
            </Text>

            {/* Ingredient count */}
            {!isLocked && (
              <View style={styles.ingredientInfo}>
                <Text style={styles.ingredientIcon}>🥘</Text>
                <Text style={styles.ingredientText}>
                  {recipe.ingredients?.length || 3} ingredients
                </Text>
              </View>
            )}

            {/* Difficulty dots */}
            {!isLocked && (
              <View style={styles.difficultyContainer}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.difficultyDot,
                      {
                        backgroundColor: i < difficulty.dots
                          ? 'rgba(255, 255, 255, 0.9)'
                          : 'rgba(255, 255, 255, 0.2)',
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Stars container */}
          {!isLocked && (
            <View style={styles.starsContainer}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Animated.Text
                  key={i}
                  style={[
                    styles.star,
                    {
                      opacity: i < starsEarned ? 1 : 0.25,
                      transform: [
                        {
                          scale: shimmerAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, i < starsEarned ? 1.3 : 1, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  ⭐
                </Animated.Text>
              ))}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    margin: theme.spacing.sm,
  },
  card: {
    borderRadius: 20,
    width: theme.layout.screenWidth * 0.42,
    height: theme.layout.screenWidth * 0.62, // Taller for better proportions
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    width: 60,
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 24,
    opacity: 0.6,
  },
  pattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '50%',
    opacity: 0.1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
  },
  circle1: {
    width: 60,
    height: 60,
    top: -20,
    right: -20,
  },
  circle2: {
    width: 40,
    height: 40,
    top: 30,
    right: 10,
  },
  circle3: {
    width: 30,
    height: 30,
    top: 60,
    right: 50,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  topContent: {
    alignItems: 'center',
    width: '100%',
  },
  tierBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    zIndex: 5,
  },
  tierText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.secondary,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  emojiContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  emoji: {
    fontSize: 56,
  },
  name: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  bottomContent: {
    alignItems: 'center',
    width: '100%',
  },
  ingredientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  ingredientIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  ingredientText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.secondary,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    zIndex: 10,
    backdropFilter: 'blur(8px)',
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  lockIcon: {
    fontSize: 40,
  },
  lockText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.secondary,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  lockStars: {
    color: '#FFD700',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: '700',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  perfectBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  perfectText: {
    fontSize: 18,
  },
  starsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  star: {
    fontSize: 16,
    marginHorizontal: 2,
  },
});

export default RecipeCard;

