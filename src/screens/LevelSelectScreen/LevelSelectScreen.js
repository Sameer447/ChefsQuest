import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { RECIPES, GameContext } from '../../data/recipes';
import RecipeCard from '../../components/RecipeCard';
import { theme } from '../../constants/theme';

const LevelSelectScreen = () => {
  const navigation = useNavigation();
  const { progress } = useContext(GameContext);
  const headerScale = useRef(new Animated.Value(0)).current;
  const starPulse = useRef(new Animated.Value(1)).current;

  const totalStars = Object.values(progress).reduce((sum, level) => sum + level.stars, 0);

  useEffect(() => {
    // Header animation
    Animated.spring(headerScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Star pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(starPulse, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(starPulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const renderItem = ({ item, index }) => {
    const levelProgress = progress[item.id] || { stars: 0, completed: false };
    const isLocked = totalStars < item.unlockedAt;

    return (
      <Animated.View
        style={{
          opacity: headerScale,
          transform: [
            {
              translateY: headerScale.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}
      >
        <RecipeCard
          recipe={item}
          onPress={() => navigation.navigate('Game', { recipeId: item.id })}
          isLocked={isLocked}
          starsEarned={levelProgress.stars}
        />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradients.cool}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require('../../assets/images/back-icon.png')}
            style={{ width: 24, height: 12 }}
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.headerContent,
            { transform: [{ scale: headerScale }] },
          ]}
        >
          <Text style={styles.title}>🎯 Select a Recipe</Text>
          <View style={styles.starContainer}>
            <Animated.Text
              style={[
                styles.starCount,
                { transform: [{ scale: starPulse }] },
              ]}
            >
              ⭐
            </Animated.Text>
            <Text style={styles.starText}>{totalStars} Stars Collected</Text>
          </View>
          <Text style={styles.subtitle}>Choose your culinary challenge!</Text>
        </Animated.View>
      </LinearGradient>

      <View style={styles.listContainer}>
        <FlatList
          data={RECIPES}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundDark,
  },
  header: {
    paddingTop: 50,
    paddingBottom: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.lg,
    borderBottomLeftRadius: theme.borderRadius['3xl'],
    borderBottomRightRadius: theme.borderRadius['3xl'],
    ...theme.shadows.lg,
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
  backButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.secondary,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontFamily: theme.typography.fontFamily.primary,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    marginBottom: theme.spacing.md,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.sm,
  },
  starCount: {
    fontSize: theme.typography.fontSize['2xl'],
    marginRight: theme.spacing.sm,
  },
  starText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.secondary,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.secondary,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  list: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing['2xl'],
  },
});

export default LevelSelectScreen;
