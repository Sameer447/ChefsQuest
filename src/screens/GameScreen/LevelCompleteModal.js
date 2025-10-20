import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import CustomButton from '../../components/CustomButton';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

const LevelCompleteModal = ({ visible, onPlayNext, onReplay, onBackToRecipes, stars, funFact }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const star1Anim = useRef(new Animated.Value(0)).current;
  const star2Anim = useRef(new Animated.Value(0)).current;
  const star3Anim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(Array(20).fill(0).map(() => new Animated.Value(0))).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      ReactNativeHapticFeedback.trigger('notificationSuccess');
      
      // Modal entrance
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Staggered star animations
      const starAnims = [star1Anim, star2Anim, star3Anim];
      Animated.stagger(200, 
        starAnims.slice(0, stars).map(anim =>
          Animated.sequence([
            Animated.spring(anim, {
              toValue: 1.5,
              tension: 100,
              friction: 3,
              useNativeDriver: true,
            }),
            Animated.spring(anim, {
              toValue: 1,
              tension: 50,
              friction: 5,
              useNativeDriver: true,
            }),
          ])
        )
      ).start();

      // Confetti animation
      confettiAnims.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000 + Math.random() * 1000,
          delay: Math.random() * 500,
          useNativeDriver: true,
        }).start();
      });

      // Continuous rotation for trophy
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      scaleAnim.setValue(0);
      star1Anim.setValue(0);
      star2Anim.setValue(0);
      star3Anim.setValue(0);
      confettiAnims.forEach(anim => anim.setValue(0));
      rotateAnim.setValue(0);
    }
  }, [visible]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderConfetti = () => {
    return confettiAnims.map((anim, index) => {
      const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 800],
      });
      
      const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 400],
      });

      const rotate = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', `${Math.random() * 720}deg`],
      });

      const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#A770EF', '#56AB2F'];
      const color = colors[index % colors.length];

      return (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              backgroundColor: color,
              transform: [
                { translateY },
                { translateX },
                { rotate },
              ],
              opacity: anim.interpolate({
                inputRange: [0, 0.1, 0.9, 1],
                outputRange: [0, 1, 1, 0],
              }),
            },
          ]}
        />
      );
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        {/* Confetti */}
        <View style={styles.confettiContainer}>
          {renderConfetti()}
        </View>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalWrapper,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={theme.gradients.sunset}
            style={styles.modalContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Trophy */}
            <Animated.Text
              style={[
                styles.trophy,
                { transform: [{ rotate: rotation }] },
              ]}
            >
              🏆
            </Animated.Text>

            <Text style={styles.title}>🎉 Level Complete! 🎉</Text>

            {/* Stars */}
            <View style={styles.starsContainer}>
              <Animated.Text
                style={[
                  styles.star,
                  { transform: [{ scale: star1Anim }] },
                ]}
              >
                {stars >= 1 ? '⭐' : '☆'}
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.star,
                  { transform: [{ scale: star2Anim }] },
                ]}
              >
                {stars >= 2 ? '⭐' : '☆'}
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.star,
                  { transform: [{ scale: star3Anim }] },
                ]}
              >
                {stars >= 3 ? '⭐' : '☆'}
              </Animated.Text>
            </View>

            <Text style={styles.starsText}>
              {stars === 3 ? 'Perfect!' : stars === 2 ? 'Great Job!' : 'Good Effort!'}
            </Text>

            {/* Fun Fact */}
            <View style={styles.funFactContainer}>
              <Text style={styles.funFactLabel}>💡 Did you know?</Text>
              <Text style={styles.funFact}>{funFact}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <CustomButton
                title="🏠 Back to Levels"
                onPress={onBackToRecipes}
                gradient={theme.gradients.cool}
              />
              <CustomButton
                title="🔄 Replay"
                onPress={onReplay}
                gradient={theme.gradients.accent}
              />
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    top: 0,
    left: width / 2,
  },
  modalWrapper: {
    width: width * 0.9,
    maxWidth: 400,
  },
  modalContent: {
    padding: theme.spacing['2xl'],
    borderRadius: theme.borderRadius['3xl'],
    alignItems: 'center',
    ...theme.shadows.xl,
  },
  trophy: {
    fontSize: 80,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontFamily: theme.typography.fontFamily.primary,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  star: {
    fontSize: 60,
    marginHorizontal: theme.spacing.sm,
  },
  starsText: {
    fontSize: theme.typography.fontSize['2xl'],
    fontFamily: theme.typography.fontFamily.primary,
    color: '#FFFFFF',
    marginBottom: theme.spacing.xl,
  },
  funFactContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.xl,
    width: '100%',
  },
  funFactLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.primary,
    color: '#FFFFFF',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  funFact: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.secondary,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
  },
});

export default LevelCompleteModal;
