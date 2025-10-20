import { createContext } from 'react';

// Import comprehensive recipe database
export { RECIPE_DATABASE as RECIPES, ALL_INGREDIENTS, DISTRACTIONS, ICON_MAP } from './recipesData';

// --- CONTEXT & STATE MANAGEMENT ---

export const GameContext = createContext();

// Initial progress for all 100+ recipes
export const getInitialProgress = () => {
  const { RECIPE_DATABASE } = require('./recipesData');
  const initialProgress = {};
  
  RECIPE_DATABASE.forEach(recipe => {
    initialProgress[recipe.id] = {
      stars: 0,
      completed: false,
      attempts: 0,
      bestTime: null,
      lastPlayed: null,
    };
  });
  
  return initialProgress;
};

export const initialProgress = getInitialProgress();
