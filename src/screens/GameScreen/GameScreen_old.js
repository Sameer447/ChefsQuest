import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RECIPES, DISTRACTIONS, GameContext } from '../../data/recipes';
import IngredientTile from '../../components/IngredientTile';
import LevelCompleteModal from './LevelCompleteModal';
import { COLORS } from '../../constants/colors';
import { playCorrectSound, playIncorrectSound, playLevelCompleteSound } from '../../utils/SoundManager';
import _ from 'lodash';

const GameScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { recipeId } = route.params;
  const recipe = RECIPES.find((r) => r.id === recipeId);
  const { updateProgress } = useContext(GameContext);

  const [grid, setGrid] = useState([]);
  const [collected, setCollected] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);

  useEffect(() => {
    generateGrid();
  }, [recipeId]);

  const generateGrid = () => {
    const required = recipe.ingredients;
    const numDistractions = Math.min(DISTRACTIONS.length, 12 - required.length);
    const distractions = _.shuffle(DISTRACTIONS).slice(0, numDistractions);
    
    const allItems = _.shuffle([...required, ...distractions]);
    setGrid(allItems.map((item, index) => ({ id: `${item}-${index}`, name: item })));
    setCollected([]);
    setMistakes(0);
    setLevelComplete(false);
  };

  const handleTileTap = (tappedItem) => {
    if (recipe.ingredients.includes(tappedItem.name)) {
      if (!collected.includes(tappedItem.name)) {
        playCorrectSound();
        const newCollected = [...collected, tappedItem.name];
        setCollected(newCollected);

        if (newCollected.length === recipe.ingredients.length) {
          playLevelCompleteSound();
          const stars = 3 - mistakes;
          updateProgress(recipe.id, { stars, completed: true });
          setLevelComplete(true);
        }
      }
    } else {
      playIncorrectSound();
      setMistakes(mistakes + 1);
      Alert.alert("Oops!", "That's not a required ingredient.");
      if (mistakes + 1 >= 3) {
        // Fail state
        Alert.alert("Too many mistakes!", "Try again?", [
          { text: "Retry", onPress: generateGrid },
          { text: "Back to Levels", onPress: () => navigation.goBack() }
        ]);
      }
    }
  };

  const getStars = () => Math.max(0, 3 - mistakes);

  return (
    <View style={styles.container}>
      <Text style={styles.recipeName}>Find ingredients for: {recipe.name}</Text>
      <View style={styles.ingredientList}>
        {recipe.ingredients.map(ing => (
          <Text key={ing} style={[styles.ingredientText, collected.includes(ing) && styles.collectedText]}>
            {ing}
          </Text>
        ))}
      </View>
      <FlatList
        data={grid}
        renderItem={({ item }) => (
          <IngredientTile
            ingredientName={item.name}
            onPress={() => handleTileTap(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={4}
        contentContainerStyle={styles.grid}
      />
      <LevelCompleteModal
        visible={levelComplete}
        onPlayNext={() => navigation.goBack()} // Simplified: just go back to level select
        onReplay={generateGrid}
        onBackToRecipes={() => navigation.goBack()}
        stars={getStars()}
        funFact={recipe.funFact}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  recipeName: {
    fontSize: 22,
    fontFamily: 'BalsamiqSans-Bold',
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  ingredientList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ingredientText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginHorizontal: 5,
    color: COLORS.text,
  },
  collectedText: {
    textDecorationLine: 'line-through',
    color: COLORS.secondary,
  },
  grid: {
    justifyContent: 'center',
  },
});

export default GameScreen;
