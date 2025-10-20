import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Simulate loading assets and fetching data
    setTimeout(() => {
      navigation.replace('MainMenu');
    }, 2000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Chef's Quest</Text>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  logo: {
    fontSize: 48,
    fontFamily: 'BalsamiqSans-Bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
});

export default SplashScreen;
