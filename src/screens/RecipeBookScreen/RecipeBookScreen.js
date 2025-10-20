import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { RECIPES, GameContext } from '../../data/recipes';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

const RecipeCard = ({ item, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation with stagger
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Continuous shine animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleFlip = () => {
    ReactNativeHapticFeedback.trigger('impactMedium');
    
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const shineTranslate = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handleFlip} activeOpacity={0.9}>
        {/* Front of card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ rotateY: frontInterpolate }],
              opacity: frontOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={theme.gradients.success}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            {/* Shine effect */}
            <Animated.View
              style={[
                styles.shineEffect,
                {
                  transform: [{ translateX: shineTranslate }],
                },
              ]}
            />
            
            <Text style={styles.recipeEmoji}>{item.emoji}</Text>
            <Text style={styles.recipeName}>{item.name}</Text>
            <View style={styles.tapHintContainer}>
              <Text style={styles.tapHint}>👆 Tap to reveal recipe</Text>
            </View>
            
            {/* Decorative corner ornaments */}
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </LinearGradient>
        </Animated.View>

        {/* Back of card */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            {
              transform: [{ rotateY: backInterpolate }],
              opacity: backOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={theme.gradients.sunset}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <Text style={styles.backTitle}>🧑‍🍳 Recipe Details</Text>
            
            <View style={styles.ingredientsContainer}>
              <Text style={styles.ingredientsLabel}>Ingredients:</Text>
              {item.ingredients?.map((ingredient, idx) => (
                <View key={idx} style={styles.ingredientRow}>
                  <Text style={styles.ingredientBullet}>•</Text>
                  <Text style={styles.ingredientText}>{ingredient.name}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.funFactContainer}>
              <Text style={styles.funFactLabel}>💡 Fun Fact</Text>
              <Text style={styles.funFactText}>{item.funFact}</Text>
            </View>

            <Text style={styles.tapHintBack}>👆 Tap to flip back</Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const RecipeBookScreen = () => {
  const { progress } = useContext(GameContext);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const emptyAnim = useRef(new Animated.Value(0)).current;

  const unlockedRecipes = RECIPES.filter(recipe => {
    const levelProgress = progress[recipe.id];
    return levelProgress && levelProgress.completed;
  });

  useEffect(() => {
    // Header entrance animation
    Animated.spring(headerAnim, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Empty state animation
    if (unlockedRecipes.length === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(emptyAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(emptyAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [unlockedRecipes.length]);

  const headerScale = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const headerTranslate = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  const emptyScale = emptyAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradients.warm}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              transform: [
                { scale: headerScale },
                { translateY: headerTranslate },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={theme.gradients.sunset}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <Text style={styles.title}>📖 My Recipe Book</Text>
            <Text style={styles.subtitle}>
              {unlockedRecipes.length} recipe{unlockedRecipes.length !== 1 ? 's' : ''} unlocked
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Content */}
        {unlockedRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Animated.View style={{ transform: [{ scale: emptyScale }] }}>
              <Text style={styles.emptyEmoji}>🔒</Text>
            </Animated.View>
            <Text style={styles.emptyText}>Complete levels to unlock recipes!</Text>
            <Text style={styles.emptySubtext}>Start your culinary journey now! 🌟</Text>
          </View>
        ) : (
          <FlatList
            data={unlockedRecipes}
            renderItem={({ item, index }) => <RecipeCard item={item} index={index} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerGradient: {
    borderRadius: 20,
    padding: 20,
    ...theme.shadows.medium,
  },
  title: {
    fontSize: 36,
    fontFamily: 'BalsamiqSans-Bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'BalsamiqSans-Regular',
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  listContent: {
    padding: 20,
  },
  cardContainer: {
    marginBottom: 20,
    height: 220,
  },
  card: {
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.large,
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  recipeEmoji: {
    fontSize: 64,
    marginBottom: 10,
  },
  recipeName: {
    fontSize: 28,
    fontFamily: 'BalsamiqSans-Bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  tapHintContainer: {
    marginTop: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tapHint: {
    fontSize: 14,
    fontFamily: 'BalsamiqSans-Regular',
    color: 'white',
    opacity: 0.9,
  },
  tapHintBack: {
    fontSize: 14,
    fontFamily: 'BalsamiqSans-Regular',
    color: 'white',
    marginTop: 10,
    opacity: 0.8,
  },
  backTitle: {
    fontSize: 24,
    fontFamily: 'BalsamiqSans-Bold',
    color: 'white',
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  ingredientsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  ingredientsLabel: {
    fontSize: 16,
    fontFamily: 'BalsamiqSans-Bold',
    color: 'white',
    marginBottom: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  ingredientBullet: {
    color: 'white',
    fontSize: 18,
    marginRight: 8,
  },
  ingredientText: {
    fontSize: 14,
    fontFamily: 'BalsamiqSans-Regular',
    color: 'white',
    flex: 1,
  },
  funFactContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 15,
  },
  funFactLabel: {
    fontSize: 16,
    fontFamily: 'BalsamiqSans-Bold',
    color: 'white',
    marginBottom: 5,
  },
  funFactText: {
    fontSize: 13,
    fontFamily: 'BalsamiqSans-Regular',
    color: 'white',
    lineHeight: 18,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    borderTopLeftRadius: 10,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    borderTopRightRadius: 10,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    borderBottomLeftRadius: 10,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    borderBottomRightRadius: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 22,
    fontFamily: 'BalsamiqSans-Bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: 'BalsamiqSans-Regular',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.8,
  },
});

export default RecipeBookScreen;
