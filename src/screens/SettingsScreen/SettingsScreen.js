import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../constants/colors';

const SettingsScreen = () => {
  const [musicEnabled, setMusicEnabled] = React.useState(true);
  const [sfxEnabled, setSfxEnabled] = React.useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Background Music</Text>
        <Switch
          value={musicEnabled}
          onValueChange={setMusicEnabled}
          trackColor={{ false: '#767577', true: COLORS.primary }}
          thumbColor={musicEnabled ? COLORS.accent : '#f4f3f4'}
        />
      </View>
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Sound Effects</Text>
        <Switch
          value={sfxEnabled}
          onValueChange={setSfxEnabled}
          trackColor={{ false: '#767577', true: COLORS.primary }}
          thumbColor={sfxEnabled ? COLORS.accent : '#f4f3f4'}
        />
      </View>
      <CustomButton title="Reset Progress" onPress={() => { /* Add confirmation */ }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 32,
    fontFamily: 'BalsamiqSans-Bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginVertical: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
  },
});

export default SettingsScreen;
