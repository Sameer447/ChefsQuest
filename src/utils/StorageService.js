import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const KEYS = {
  USER_PROGRESS: '@chef_quest:user_progress',
  USER_STATS: '@chef_quest:user_stats',
  USER_ACHIEVEMENTS: '@chef_quest:user_achievements',
  USER_SESSION: '@chef_quest:user_session',
  USER_SETTINGS: '@chef_quest:user_settings',
};

// ===== USER PROGRESS =====

export const saveUserProgress = async (progress) => {
  try {
    const jsonValue = JSON.stringify(progress);
    await AsyncStorage.setItem(KEYS.USER_PROGRESS, jsonValue);
    console.log('[Storage] Progress saved successfully');
    return true;
  } catch (error) {
    console.error('[Storage] Error saving progress:', error);
    return false;
  }
};

export const getUserProgress = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(KEYS.USER_PROGRESS);
    if (jsonValue !== null) {
      console.log('[Storage] Progress loaded from storage');
      return JSON.parse(jsonValue);
    }
    console.log('[Storage] No saved progress found, returning default');
    return getDefaultProgress();
  } catch (error) {
    console.error('[Storage] Error loading progress:', error);
    return getDefaultProgress();
  }
};

const getDefaultProgress = () => {
  // Default progress for all 100 levels
  const defaultProgress = {};
  const { RECIPE_DATABASE } = require('../data/recipesData');
  
  RECIPE_DATABASE.forEach(recipe => {
    defaultProgress[recipe.id] = {
      stars: 0,
      completed: false,
      attempts: 0,
      bestTime: null,
      lastPlayed: null,
    };
  });
  
  return defaultProgress;
};

// ===== USER STATISTICS =====

export const saveUserStats = async (stats) => {
  try {
    const jsonValue = JSON.stringify(stats);
    await AsyncStorage.setItem(KEYS.USER_STATS, jsonValue);
    console.log('[Storage] Stats saved successfully');
    return true;
  } catch (error) {
    console.error('[Storage] Error saving stats:', error);
    return false;
  }
};

export const getUserStats = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(KEYS.USER_STATS);
    if (jsonValue !== null) {
      console.log('[Storage] Stats loaded from storage');
      return JSON.parse(jsonValue);
    }
    console.log('[Storage] No saved stats found, returning default');
    return getDefaultStats();
  } catch (error) {
    console.error('[Storage] Error loading stats:', error);
    return getDefaultStats();
  }
};

const getDefaultStats = () => ({
  totalStars: 0,
  totalLevelsCompleted: 0,
  totalGamesPlayed: 0,
  totalTimePlayed: 0, // in seconds
  perfectGames: 0, // 3-star completions
  totalMistakes: 0,
  highestCombo: 0,
  firstPlayedDate: new Date().toISOString(),
  lastPlayedDate: new Date().toISOString(),
  currentStreak: 0,
  longestStreak: 0,
  achievementsUnlocked: 0,
});

export const updateUserStats = async (updates) => {
  try {
    const currentStats = await getUserStats();
    const updatedStats = {
      ...currentStats,
      ...updates,
      lastPlayedDate: new Date().toISOString(),
    };
    await saveUserStats(updatedStats);
    return updatedStats;
  } catch (error) {
    console.error('[Storage] Error updating stats:', error);
    return null;
  }
};

// ===== USER ACHIEVEMENTS =====

export const ACHIEVEMENTS = [
  { id: 'first_recipe', name: 'First Recipe', description: 'Complete your first recipe', requirement: 1, icon: '🎖️' },
  { id: 'five_star', name: 'Five Star Chef', description: 'Get 3 stars on 5 recipes', requirement: 5, icon: '⭐' },
  { id: 'ten_star', name: 'Master Chef', description: 'Get 3 stars on 10 recipes', requirement: 10, icon: '👨‍🍳' },
  { id: 'twenty_five_star', name: 'Culinary Expert', description: 'Get 3 stars on 25 recipes', requirement: 25, icon: '🏆' },
  { id: 'fifty_star', name: 'Kitchen Legend', description: 'Get 3 stars on 50 recipes', requirement: 50, icon: '🌟' },
  { id: 'all_star', name: 'Perfect Chef', description: 'Get 3 stars on all 100 recipes', requirement: 100, icon: '💎' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete 10 levels in under 30 seconds each', requirement: 10, icon: '⚡' },
  { id: 'no_mistakes', name: 'Perfectionist', description: 'Complete 5 levels with no mistakes', requirement: 5, icon: '✨' },
  { id: 'combo_master', name: 'Combo Master', description: 'Achieve a 10x combo', requirement: 10, icon: '🔥' },
  { id: 'weekly_streak', name: 'Dedication', description: 'Play for 7 days in a row', requirement: 7, icon: '📅' },
  { id: 'century_club', name: 'Century Club', description: 'Play 100 games', requirement: 100, icon: '💯' },
];

export const saveUserAchievements = async (achievements) => {
  try {
    const jsonValue = JSON.stringify(achievements);
    await AsyncStorage.setItem(KEYS.USER_ACHIEVEMENTS, jsonValue);
    console.log('[Storage] Achievements saved successfully');
    return true;
  } catch (error) {
    console.error('[Storage] Error saving achievements:', error);
    return false;
  }
};

export const getUserAchievements = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(KEYS.USER_ACHIEVEMENTS);
    if (jsonValue !== null) {
      console.log('[Storage] Achievements loaded from storage');
      return JSON.parse(jsonValue);
    }
    console.log('[Storage] No saved achievements found, returning default');
    return getDefaultAchievements();
  } catch (error) {
    console.error('[Storage] Error loading achievements:', error);
    return getDefaultAchievements();
  }
};

const getDefaultAchievements = () => {
  const achievements = {};
  ACHIEVEMENTS.forEach(achievement => {
    achievements[achievement.id] = {
      unlocked: false,
      unlockedDate: null,
      progress: 0,
    };
  });
  return achievements;
};

export const checkAndUnlockAchievements = async (stats, progress) => {
  try {
    const achievements = await getUserAchievements();
    let newUnlocks = [];
    
    // Count perfect games (3 stars)
    const perfectGames = Object.values(progress).filter(p => p.stars === 3).length;
    
    // Check each achievement
    ACHIEVEMENTS.forEach(achievement => {
      if (!achievements[achievement.id].unlocked) {
        let shouldUnlock = false;
        let currentProgress = 0;
        
        switch (achievement.id) {
          case 'first_recipe':
            currentProgress = stats.totalLevelsCompleted;
            shouldUnlock = stats.totalLevelsCompleted >= 1;
            break;
          case 'five_star':
            currentProgress = perfectGames;
            shouldUnlock = perfectGames >= 5;
            break;
          case 'ten_star':
            currentProgress = perfectGames;
            shouldUnlock = perfectGames >= 10;
            break;
          case 'twenty_five_star':
            currentProgress = perfectGames;
            shouldUnlock = perfectGames >= 25;
            break;
          case 'fifty_star':
            currentProgress = perfectGames;
            shouldUnlock = perfectGames >= 50;
            break;
          case 'all_star':
            currentProgress = perfectGames;
            shouldUnlock = perfectGames >= 100;
            break;
          case 'combo_master':
            currentProgress = stats.highestCombo || 0;
            shouldUnlock = stats.highestCombo >= 10;
            break;
          case 'weekly_streak':
            currentProgress = stats.currentStreak || 0;
            shouldUnlock = stats.currentStreak >= 7;
            break;
          case 'century_club':
            currentProgress = stats.totalGamesPlayed;
            shouldUnlock = stats.totalGamesPlayed >= 100;
            break;
        }
        
        // Update progress
        achievements[achievement.id].progress = currentProgress;
        
        // Unlock if requirement met
        if (shouldUnlock) {
          achievements[achievement.id].unlocked = true;
          achievements[achievement.id].unlockedDate = new Date().toISOString();
          newUnlocks.push(achievement);
        }
      }
    });
    
    // Save updated achievements
    await saveUserAchievements(achievements);
    
    // Return newly unlocked achievements
    return newUnlocks;
  } catch (error) {
    console.error('[Storage] Error checking achievements:', error);
    return [];
  }
};

// ===== USER SESSION =====

export const saveUserSession = async (session) => {
  try {
    const jsonValue = JSON.stringify(session);
    await AsyncStorage.setItem(KEYS.USER_SESSION, jsonValue);
    return true;
  } catch (error) {
    console.error('[Storage] Error saving session:', error);
    return false;
  }
};

export const getUserSession = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(KEYS.USER_SESSION);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    }
    return getDefaultSession();
  } catch (error) {
    console.error('[Storage] Error loading session:', error);
    return getDefaultSession();
  }
};

const getDefaultSession = () => ({
  sessionId: Date.now().toString(),
  startTime: new Date().toISOString(),
  levelsPlayed: [],
  sessionStats: {
    gamesPlayed: 0,
    starsEarned: 0,
    mistakesMade: 0,
  },
});

export const startNewSession = async () => {
  const newSession = getDefaultSession();
  await saveUserSession(newSession);
  return newSession;
};

export const endSession = async () => {
  const session = await getUserSession();
  session.endTime = new Date().toISOString();
  await saveUserSession(session);
  return session;
};

// ===== USER SETTINGS =====

export const saveUserSettings = async (settings) => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(KEYS.USER_SETTINGS, jsonValue);
    console.log('[Storage] Settings saved successfully');
    return true;
  } catch (error) {
    console.error('[Storage] Error saving settings:', error);
    return false;
  }
};

export const getUserSettings = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(KEYS.USER_SETTINGS);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    }
    return getDefaultSettings();
  } catch (error) {
    console.error('[Storage] Error loading settings:', error);
    return getDefaultSettings();
  }
};

const getDefaultSettings = () => ({
  soundEnabled: true,
  musicEnabled: true,
  musicVolume: 0.5,
  sfxVolume: 1.0,
  hapticEnabled: true,
  difficulty: 'normal', // easy, normal, hard
  theme: 'default',
  notificationsEnabled: true,
  showHints: true,
  autoPlayMusic: true,
});

// ===== UTILITY FUNCTIONS =====

export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.USER_PROGRESS,
      KEYS.USER_STATS,
      KEYS.USER_ACHIEVEMENTS,
      KEYS.USER_SESSION,
      KEYS.USER_SETTINGS,
    ]);
    console.log('[Storage] All data cleared successfully');
    return true;
  } catch (error) {
    console.error('[Storage] Error clearing data:', error);
    return false;
  }
};

export const exportUserData = async () => {
  try {
    const progress = await getUserProgress();
    const stats = await getUserStats();
    const achievements = await getUserAchievements();
    const settings = await getUserSettings();
    
    return {
      progress,
      stats,
      achievements,
      settings,
      exportDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Storage] Error exporting data:', error);
    return null;
  }
};

export const importUserData = async (data) => {
  try {
    if (data.progress) await saveUserProgress(data.progress);
    if (data.stats) await saveUserStats(data.stats);
    if (data.achievements) await saveUserAchievements(data.achievements);
    if (data.settings) await saveUserSettings(data.settings);
    
    console.log('[Storage] Data imported successfully');
    return true;
  } catch (error) {
    console.error('[Storage] Error importing data:', error);
    return false;
  }
};

// Calculate streak
export const calculateStreak = async () => {
  try {
    const stats = await getUserStats();
    const lastPlayed = new Date(stats.lastPlayedDate);
    const today = new Date();
    
    // Reset time to midnight for accurate day comparison
    lastPlayed.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - lastPlayed) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Played today, streak continues
      return stats;
    } else if (diffDays === 1) {
      // Played yesterday, increment streak
      const newStreak = (stats.currentStreak || 0) + 1;
      const longestStreak = Math.max(newStreak, stats.longestStreak || 0);
      const updatedStats = await updateUserStats({
        currentStreak: newStreak,
        longestStreak: longestStreak,
      });
      return updatedStats;
    } else {
      // Streak broken, reset to 1
      const updatedStats = await updateUserStats({
        currentStreak: 1,
      });
      return updatedStats;
    }
  } catch (error) {
    console.error('[Storage] Error calculating streak:', error);
    return stats;
  }
};

// Default export with all functions
const StorageService = {
  saveUserProgress,
  getUserProgress,
  saveUserStats,
  getUserStats,
  updateUserStats,
  saveUserAchievements,
  getUserAchievements,
  checkAndUnlockAchievements,
  saveUserSession,
  getUserSession,
  startNewSession,
  endSession,
  saveUserSettings,
  getUserSettings,
  clearAllData,
  exportUserData,
  importUserData,
  calculateStreak,
};

export default StorageService;
