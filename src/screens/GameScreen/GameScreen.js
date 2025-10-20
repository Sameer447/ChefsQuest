import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Animated, Dimensions, TouchableOpacity, StatusBar, Platform, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { RECIPES, DISTRACTIONS, GameContext } from '../../data/recipes';
import IngredientTile from '../../components/IngredientTile';
import LevelCompleteModal from './LevelCompleteModal';
import { theme } from '../../constants/theme';
import { playCorrectSound, playIncorrectSound, playLevelCompleteSound } from '../../utils/SoundManager';
import { useAndroidBars, AndroidBarPresets } from '../../utils/useAndroidBars';
import _ from 'lodash';

const { width } = Dimensions.get('window');

// Status bar height fallback for Android translucent status bar
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

// --- NEW/UPDATED COMPONENT: IngredientProgressChip ---

const IngredientProgressChip = ({ name, isCollected }) => (
  <View style={[
    styles.ingredientChipNew, 
    isCollected ? styles.ingredientChipCollected : styles.ingredientChipPending
  ]}>
    <Text style={[styles.ingredientTextNew, isCollected ? styles.ingredientTextCollected : null]}>
      {isCollected ? '✓' : '•'} {name.toUpperCase()}
    </Text>
  </View>
);

// --- MAIN GAME SCREEN ---

const GameScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { recipeId } = route.params;
  const recipe = RECIPES.find((r) => r.id === recipeId);
  const { updateProgress } = useContext(GameContext);

  // Manage Android status bar for immersive gameplay (use a non-immersive preset so status bar remains visible)
  useAndroidBars(AndroidBarPresets.levelSelect);

  const [grid, setGrid] = useState([]);
  const [collected, setCollected] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [combo, setCombo] = useState(0);

  // Animation refs (Simplified)
  const comboAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current; // Only for mistakes animation
  // progressAnim and headerScale are removed/ignored

  useEffect(() => {
    generateGrid();
  }, [recipeId]);

  useEffect(() => {
    // Combo animation
    if (combo > 1) {
      Animated.sequence([
        Animated.spring(comboAnim, {
          toValue: 1.5,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(comboAnim, {
          toValue: 1,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [combo]);

  const generateGrid = () => {
    const required = recipe.ingredients;
    // Use a higher number of tiles (e.g., 16 total for a larger grid)
    const gridSize = 16; 
    const numRequired = required.length;
    const numDistractions = Math.min(DISTRACTIONS.length, gridSize - numRequired);
    const distractions = _.shuffle(DISTRACTIONS).slice(0, numDistractions);
    
    // Fill remaining spots with duplicates of required ingredients or more distractions
    const remainingSpots = gridSize - numRequired - distractions.length;
    const paddingDistractions = _.shuffle(DISTRACTIONS).slice(0, remainingSpots);

    const allItems = _.shuffle([...required, ...distractions, ...paddingDistractions]);

    // Ensure grid is exactly the size you want
    setGrid(allItems.slice(0, gridSize).map((item, index) => ({ 
        id: `${item}-${index}-${Math.random()}`, 
        name: item 
    })));


    setCollected([]);
    setMistakes(0);
    setLevelComplete(false);
    setCombo(0);
  };

  const handleTileTap = (tappedItem) => {
    
    // Check if it's a required ingredient
    const isRequired = recipe.ingredients.includes(tappedItem.name);
    
    if (isRequired) {
      // Check if already collected (assuming only 1 of each is required per the original logic)
      const alreadyCollected = collected.includes(tappedItem.name);
      
      if (!alreadyCollected) {
        playCorrectSound();
        setCombo(combo + 1);
        const newCollected = [...collected, tappedItem.name];
        setCollected(newCollected);

        // Check if level is complete
        const isComplete = newCollected.length === recipe.ingredients.length;
        
        if (isComplete) {
          const stars = Math.max(1, 3 - mistakes);
          playLevelCompleteSound();
          updateProgress(recipe.id, { stars, completed: true });
          setTimeout(() => {
            setLevelComplete(true);
          }, 800);
        }
      } else {
        // Already collected this one, ignore tap (no mistake, no combo increment)
        setCombo(0);
      }
    } else {
      // Wrong ingredient (Distraction)
      playIncorrectSound();
      setCombo(0);
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      
      // Shake animation for mistakes (applied to header)
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      if (newMistakes >= 3) {
        setTimeout(() => {
          Alert.alert("Too many mistakes!", "Try again?", [
            { text: "Retry", onPress: generateGrid },
            { text: "Back to Levels", onPress: () => navigation.goBack() }
          ]);
        }, 100);
      }
    }
  };

  const onPlayNextHandler = () => {
      const nextRecipeIndex = RECIPES.findIndex(r => r.id === recipeId) + 1;
      if (nextRecipeIndex < RECIPES.length) {
        navigation.replace('Game', { recipeId: RECIPES[nextRecipeIndex].id });
      } else {
        navigation.goBack();
      }
    };

  const getStars = () => Math.max(0, 3 - mistakes);
  const totalRequired = recipe.ingredients.length;
  const collectedCount = collected.length;
  const progressPercent = (collectedCount / totalRequired) * 100;


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* <StatusBar
        barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      /> */}
      <LinearGradient
        colors={theme.gradients.background}
        style={styles.gradientBackground}
      >
        {/* ENHANCED HEADER */}
        <Animated.View
          style={[
            styles.enhancedHeader,
            { paddingTop: STATUS_BAR_HEIGHT + theme.spacing.sm, transform: [{ translateY: 0 }, { translateX: shakeAnim }] },
          ]}
        >
          {/* Top Bar (Back Button and Title) */}
          <View style={styles.headerTopBar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Image
                   source={require('../../assets/images/back-icon.png')}
                   style={{ width: 24, height: 12 }}
                 />
              </TouchableOpacity>
              <Text style={styles.recipeTitle} numberOfLines={1}>
                  {recipe.name || 'Recipe'} Challenge
              </Text>
          </View>
          
          {/* Stats Row */}
          <View style={styles.statsRow}>
              <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Mistakes</Text>
                  <Text style={[styles.statValue, mistakes > 0 && { color: theme.colors.error }]}>{mistakes}/3</Text>
              </View>
              <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Target</Text>
                  <Text style={styles.statValue}>{collectedCount}/{totalRequired}</Text>
              </View>
          </View>

          {/* Combo Badge */}
          {combo > 1 && (
            <Animated.View
              style={[
                styles.comboBoxNew,
                { transform: [{ scale: comboAnim }] },
              ]}
            >
              <Text style={styles.comboTextNew}>🔥 {combo}x COMBO!</Text>
            </Animated.View>
          )}

          {/* Progress Bar */}
          <View style={styles.progressBarContainerNew}>
            <View style={[styles.progressBarFillNew, { width: `${progressPercent}%` }]}>
              <LinearGradient
                colors={theme.gradients.success}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          </View>

        </Animated.View>

        {/* Required Ingredients Progress (New Style) */}
        <View style={styles.progressChipContainer}>
          <Text style={styles.progressTitle}>Ingredients Needed:</Text>
          <View style={styles.ingredientChipList}>
            {recipe.ingredients.map(ing => (
              <IngredientProgressChip
                key={ing}
                name={ing}
                isCollected={collected.includes(ing)}
              />
            ))}
          </View>
        </View>

        {/* Game Grid */}
        <View style={styles.gameGridContainer}>
          <FlatList
            data={grid}
            renderItem={({ item }) => (
              <IngredientTile
                ingredientName={item.name}
                onPress={() => handleTileTap(item)}
                // Crucially, we ignore isCollected to prevent ingredients from hiding/changing
                // visual state in the grid after being tapped once.
                isCollected={false} 
              />
            )}
            keyExtractor={(item) => item.id}
            numColumns={4} // 4x4 grid looks modern
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true} // Allow scrolling on smaller screens so tiles aren't clipped
          />
        </View>

        {/* Level Complete Modal */}
        <LevelCompleteModal
          visible={levelComplete}
          onPlayNext={onPlayNextHandler}
          onReplay={generateGrid}
          onBackToRecipes={() => navigation.goBack()}
          stars={getStars()}
          funFact={recipe.funFact}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gradientBackground: {
    flex: 1,
  },
  
  // --- ENHANCED HEADER STYLES ---
  enhancedHeader: {
    backgroundColor: theme.colors.primary, 
    paddingBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  headerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  backIcon: {
    fontSize: 18,
    color: theme.colors.textOnPrimary,
    fontWeight: 'bold',
  },
  recipeTitle: {
    flex: 1,
    fontSize: 24,
    fontFamily: theme.typography.fontFamily.primaryBold,
    fontWeight: '900',
    color: theme.colors.textOnPrimary,
    textAlign: 'center',
    marginRight: theme.spacing.xl, // Offset for back button
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: theme.typography.fontFamily.secondary,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textOnPrimary,
    fontFamily: theme.typography.fontFamily.primaryBold,
  },
  progressBarContainerNew: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: theme.borderRadius.full,
    marginHorizontal: theme.spacing.md,
    overflow: 'hidden',
  },
  progressBarFillNew: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: theme.borderRadius.full,
  },
  comboBoxNew: {
    position: 'absolute',
    top: '70%',
    left: '50%',
    transform: [{ translateX: -70 }],
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    zIndex: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 8,
  },
  comboTextNew: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.primaryBold,
    fontWeight: '800',
    color: '#FF6B6B',
  },

  // --- PROGRESS CHIP STYLES ---
  progressChipContainer: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  progressTitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.secondary,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
  },
  ingredientChipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  ingredientChipNew: {
    borderRadius: theme.borderRadius.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 2,
    transitionDuration: 300,
  },
  ingredientChipPending: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: theme.colors.border,
  },
  ingredientChipCollected: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.successDark,
  },
  ingredientTextNew: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  ingredientTextCollected: {
    color: theme.colors.textOnPrimary,
    fontWeight: '700',
  },

  // --- GAME GRID STYLES ---
  gameGridContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
  },
  grid: {
    paddingVertical: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center', // Center the 4x4 grid
  },
});

export default GameScreen;