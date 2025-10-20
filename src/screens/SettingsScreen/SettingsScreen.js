import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Alert, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import { 
  getUserSettings, 
  saveUserSettings, 
  clearAllData, 
  exportUserData 
} from '../../utils/StorageService';
import soundManager, { 
  setMusicEnabled, 
  setSoundEnabled, 
  setMusicVolume, 
  setSfxVolume,
  playTapSound,
  playCorrectSound 
} from '../../utils/SoundManager';
import { useAndroidBars, AndroidBarPresets } from '../../utils/useAndroidBars';
import CustomButton from '../../components/CustomButton';
import { theme } from '../../constants/theme';

const SettingsScreen = ({ navigation }) => {
  // Apply Android bars preset
  useAndroidBars(AndroidBarPresets.settings);

  // Settings state
  const [settings, setSettings] = useState({
    musicEnabled: true,
    soundEnabled: true,
    musicVolume: 0.5,
    sfxVolume: 1.0,
    hapticEnabled: true,
    showHints: true,
    autoPlayMusic: true,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getUserSettings();
      setSettings(savedSettings);
      
      // Apply sound settings
      setSoundEnabled(savedSettings.soundEnabled);
      setMusicEnabled(savedSettings.musicEnabled);
      setMusicVolume(savedSettings.musicVolume || 0.5);
      setSfxVolume(savedSettings.sfxVolume || 1.0);
      
      setIsLoading(false);
    } catch (error) {
      console.error('[Settings] Error loading settings:', error);
      setIsLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await saveUserSettings(newSettings);
      
      // Apply setting changes immediately
      switch (key) {
        case 'musicEnabled':
          setMusicEnabled(value);
          break;
        case 'soundEnabled':
          setSoundEnabled(value);
          if (value) playTapSound(); // Test sound
          break;
        case 'musicVolume':
          setMusicVolume(value);
          break;
        case 'sfxVolume':
          setSfxVolume(value);
          break;
      }
    } catch (error) {
      console.error('[Settings] Error updating setting:', error);
    }
  };

  const handleResetProgress = () => {
    Alert.alert(
      '🗑️ Reset All Progress',
      'Are you sure you want to reset all your progress? This action cannot be undone!\n\n⚠️ You will lose:\n• All completed levels\n• All earned stars\n• All achievements\n• All statistics',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => playTapSound(),
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              playCorrectSound();
              Alert.alert(
                '✅ Success',
                'All progress has been reset. The app will restart.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate to main menu
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainMenu' }],
                      });
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to reset progress. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const data = await exportUserData();
      const dataString = JSON.stringify(data, null, 2);
      
      Alert.alert(
        '📊 Export Data',
        `Your game data has been prepared for export.\n\nData size: ${(dataString.length / 1024).toFixed(2)} KB\n\nYou can share this data to backup your progress.`,
        [
          {
            text: 'OK',
            onPress: () => playTapSound(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const testSound = () => {
    playCorrectSound();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={theme.gradients.background}
        style={styles.gradientBackground}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                playTapSound();
                navigation.goBack();
              }}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>⚙️ Settings</Text>
          </View>

          {/* Audio Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔊 Audio Settings</Text>
            
            {/* Background Music Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Background Music</Text>
                <Text style={styles.settingDescription}>Play music during gameplay</Text>
              </View>
              <Switch
                value={settings.musicEnabled}
                onValueChange={(value) => {
                  playTapSound();
                  updateSetting('musicEnabled', value);
                }}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.musicEnabled ? theme.colors.accent : theme.colors.textSecondary}
                ios_backgroundColor={theme.colors.border}
              />
            </View>

            {/* Music Volume Slider */}
            {settings.musicEnabled && (
              <View style={styles.sliderContainer}>
                <View style={styles.sliderHeader}>
                  <Text style={styles.sliderLabel}>Music Volume</Text>
                  <Text style={styles.sliderValue}>{Math.round(settings.musicVolume * 100)}%</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={settings.musicVolume}
                  onValueChange={(value) => updateSetting('musicVolume', value)}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.border}
                  thumbTintColor={theme.colors.accent}
                />
              </View>
            )}

            {/* Sound Effects Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Sound Effects</Text>
                <Text style={styles.settingDescription}>Play sound effects for actions</Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => {
                  playTapSound();
                  updateSetting('soundEnabled', value);
                }}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.soundEnabled ? theme.colors.accent : theme.colors.textSecondary}
                ios_backgroundColor={theme.colors.border}
              />
            </View>

            {/* SFX Volume Slider */}
            {settings.soundEnabled && (
              <View style={styles.sliderContainer}>
                <View style={styles.sliderHeader}>
                  <Text style={styles.sliderLabel}>SFX Volume</Text>
                  <Text style={styles.sliderValue}>{Math.round(settings.sfxVolume * 100)}%</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={settings.sfxVolume}
                  onValueChange={(value) => updateSetting('sfxVolume', value)}
                  onSlidingComplete={testSound}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.border}
                  thumbTintColor={theme.colors.accent}
                />
              </View>
            )}

            {/* Auto-play Music */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto-play Music</Text>
                <Text style={styles.settingDescription}>Start music automatically</Text>
              </View>
              <Switch
                value={settings.autoPlayMusic}
                onValueChange={(value) => {
                  playTapSound();
                  updateSetting('autoPlayMusic', value);
                }}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.autoPlayMusic ? theme.colors.accent : theme.colors.textSecondary}
                ios_backgroundColor={theme.colors.border}
              />
            </View>
          </View>

          {/* Gameplay Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎮 Gameplay Settings</Text>
            
            {/* Haptic Feedback */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Haptic Feedback</Text>
                <Text style={styles.settingDescription}>Vibration on interactions</Text>
              </View>
              <Switch
                value={settings.hapticEnabled}
                onValueChange={(value) => {
                  playTapSound();
                  updateSetting('hapticEnabled', value);
                }}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.hapticEnabled ? theme.colors.accent : theme.colors.textSecondary}
                ios_backgroundColor={theme.colors.border}
              />
            </View>

            {/* Show Hints */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Show Hints</Text>
                <Text style={styles.settingDescription}>Display helpful tips during gameplay</Text>
              </View>
              <Switch
                value={settings.showHints}
                onValueChange={(value) => {
                  playTapSound();
                  updateSetting('showHints', value);
                }}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.showHints ? theme.colors.accent : theme.colors.textSecondary}
                ios_backgroundColor={theme.colors.border}
              />
            </View>
          </View>

          {/* Data Management Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💾 Data Management</Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                playTapSound();
                handleExportData();
              }}
            >
              <Text style={styles.actionButtonIcon}>📤</Text>
              <View style={styles.actionButtonInfo}>
                <Text style={styles.actionButtonLabel}>Export Data</Text>
                <Text style={styles.actionButtonDescription}>Backup your progress</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => {
                playTapSound();
                handleResetProgress();
              }}
            >
              <Text style={styles.actionButtonIcon}>🗑️</Text>
              <View style={styles.actionButtonInfo}>
                <Text style={[styles.actionButtonLabel, styles.dangerText]}>Reset All Progress</Text>
                <Text style={styles.actionButtonDescription}>Clear all game data</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ About</Text>
            <View style={styles.aboutContainer}>
              <Text style={styles.aboutText}>Chef's Quest</Text>
              <Text style={styles.versionText}>Version 1.0.0</Text>
              <Text style={styles.creditsText}>
                A fun and educational cooking game{'\n'}
                Test your ingredient knowledge!
              </Text>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.md,
  },
  backIcon: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontFamily: theme.typography.fontFamily.primaryBold,
    fontWeight: '900',
    color: theme.colors.text,
  },
  section: {
    marginBottom: theme.spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.primaryBold,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.secondary,
    color: theme.colors.textSecondary,
  },
  sliderContainer: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sliderLabel: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.body,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  sliderValue: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.primaryBold,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  dangerButton: {
    borderColor: theme.colors.error,
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
  },
  actionButtonIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  actionButtonInfo: {
    flex: 1,
  },
  actionButtonLabel: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  actionButtonDescription: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.secondary,
    color: theme.colors.textSecondary,
  },
  dangerText: {
    color: theme.colors.error,
  },
  aboutContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  aboutText: {
    fontSize: 24,
    fontFamily: theme.typography.fontFamily.primaryBold,
    fontWeight: '900',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  versionText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.secondary,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  creditsText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: theme.spacing['2xl'],
  },
});

export default SettingsScreen;
