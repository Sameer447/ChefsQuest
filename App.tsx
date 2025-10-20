import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameContext, initialProgress } from './src/data/recipes';
import { playBackgroundMusic, stopBackgroundMusic } from './src/utils/SoundManager';
import StorageService from './src/utils/StorageService';

import MainMenuScreen from './src/screens/MainMenuScreen/MainMenuScreen';
import LevelSelectScreen from './src/screens/LevelSelectScreen/LevelSelectScreen';
import GameScreen from './src/screens/GameScreen/GameScreen';
import RecipeBookScreen from './src/screens/RecipeBookScreen/RecipeBookScreen';
import SettingsScreen from './src/screens/SettingsScreen/SettingsScreen';

const Stack = createNativeStackNavigator();

function App() {
  const [progress, setProgress] = useState<any>(initialProgress);
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('🚀 Loading user data from storage...');
        
        // Load all user data in parallel
        const [userProgress, userStats, userAchievements, userSettings] = await Promise.all([
          StorageService.getUserProgress(),
          StorageService.getUserStats(),
          StorageService.getUserAchievements(),
          StorageService.getUserSettings(),
        ]);

        console.log('✅ User data loaded:', {
          levelsCompleted: userStats.totalLevelsCompleted,
          totalStars: userStats.totalStars,
          currentStreak: userStats.currentStreak,
        });

        setProgress(userProgress);
        setStats(userStats);
        setAchievements(userAchievements);
        setSettings(userSettings);

        // Calculate and update streak
        const updatedStats = await StorageService.calculateStreak();
        setStats(updatedStats);

        // Start new session
        const newSession = await StorageService.startNewSession();
        setSessionId(newSession.sessionId);
        console.log('📊 Session started:', newSession.sessionId);

        setLoading(false);
      } catch (error) {
        console.error('❌ Error loading user data:', error);
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Play background music and handle cleanup
  useEffect(() => {
    if (!loading) {
      playBackgroundMusic();
    }

    return () => {
      stopBackgroundMusic();
      if (sessionId) {
        StorageService.endSession().then(() => {
          console.log('📊 Session ended:', sessionId);
        });
      }
    };
  }, [loading, sessionId]);

  const updateProgress = async (recipeId: string, newStats: any) => {
    try {
      console.log(`💾 Updating progress for recipe ${recipeId}:`, newStats);

      // Update local state
      const updatedProgress: any = {
        ...progress,
        [recipeId]: {
          ...(progress as any)[recipeId],
          ...newStats,
          lastPlayed: new Date().toISOString(),
        },
      };
      setProgress(updatedProgress);

      // Save to AsyncStorage
      await StorageService.saveUserProgress(updatedProgress);

      // Update stats if level was completed
      if (newStats.completed && stats) {
        const starsEarned = newStats.stars;
        const wasAlreadyCompleted = (progress as any)[recipeId]?.completed;
        const previousStars = (progress as any)[recipeId]?.stars || 0;

        // Calculate stat updates
        const statUpdates = {
          totalGamesPlayed: stats.totalGamesPlayed + 1,
          totalLevelsCompleted: wasAlreadyCompleted 
            ? stats.totalLevelsCompleted 
            : stats.totalLevelsCompleted + 1,
          totalStars: stats.totalStars + (starsEarned - previousStars),
          perfectGames: starsEarned === 3 
            ? stats.perfectGames + 1 
            : stats.perfectGames,
          lastPlayedDate: new Date().toISOString(),
        };

        const updatedStats = await StorageService.updateUserStats(statUpdates);
        setStats(updatedStats);

        // Check for achievement unlocks
        const updatedAchievements = await StorageService.checkAndUnlockAchievements(
          updatedStats,
          updatedProgress
        );
        setAchievements(updatedAchievements);

        // Check for newly unlocked achievements
        if (achievements) {
          const newlyUnlocked = Object.entries(updatedAchievements).filter(
            ([id, achievement]: [string, any]) =>
              achievement.unlocked && !achievements[id]?.unlocked
          );

          if (newlyUnlocked.length > 0) {
            console.log('🏆 New achievements unlocked:', newlyUnlocked.map(([id]) => id));
          }
        }
      }

      console.log('✅ Progress saved successfully');
    } catch (error) {
      console.error('❌ Error updating progress:', error);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#FF6B6B"
          translucent={false}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading Chef's Quest...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#FF6B6B"
        translucent={false}
      />
      <GameContext.Provider value={{ progress, updateProgress, stats, achievements, settings }}>
        <NavigationContainer>
          <Stack.Navigator 
            screenOptions={{ 
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: '#fff' }
            }}
          >
            <Stack.Screen name="MainMenu" component={MainMenuScreen} />
            <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="RecipeBook" component={RecipeBookScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GameContext.Provider>
    </SafeAreaProvider>
  );
}

export default App;
