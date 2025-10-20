import Sound from 'react-native-sound';
import { Platform } from 'react-native';
import { getUserSettings } from './StorageService';

// Enable playback in silent mode and mix with other apps
Sound.setCategory('Playback', true);

// Helper function to get correct sound path for platform
const getSoundPath = (filename) => {
  // Android loads from res/raw/ directory without extension
  // iOS loads from bundle with extension
  return Platform.OS === 'android' ? filename.replace('.mp3', '') : filename;
};

// Sound Manager Class for robust sound handling
class SoundManager {
  constructor() {
    this.sounds = {};
    this.backgroundMusic = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.musicVolume = 0.5;
    this.sfxVolume = 1.0;
    this.isInitialized = false;
    this.isMusicPlaying = false;
    this.initializationPromise = this.initializeSounds();
  }

  // Initialize and preload all sounds
  initializeSounds() {
    return new Promise(async (resolve, reject) => {
      try {
        // Load settings from storage
        const settings = await getUserSettings();
        this.soundEnabled = settings.soundEnabled !== false;
        this.musicEnabled = settings.musicEnabled !== false;
        this.musicVolume = settings.musicVolume || 0.5;
        this.sfxVolume = settings.sfxVolume || 1.0;

        const soundFiles = {
          correct: 'correct.mp3',
          incorrect: 'incorrect.mp3',
          levelComplete: 'level_complete.mp3',
          tap: 'tap.mp3',
        };

        const soundPromises = Object.entries(soundFiles).map(([key, filename]) => {
          return new Promise((res, rej) => {
            const soundPath = getSoundPath(filename);
            const sound = new Sound(soundPath, Sound.MAIN_BUNDLE, (error) => {
              if (error) {
                console.error(`[SoundManager] Failed to load ${filename}:`, error);
                rej(error);
              } else {
                console.log(`[SoundManager] Successfully loaded ${filename}`);
                sound.setVolume(this.sfxVolume);
                this.sounds[key] = sound;
                res(sound);
              }
            });
          });
        });

        const bgMusicPromise = new Promise((res, rej) => {
          const bgMusicPath = getSoundPath('background_music.mp3');
          const sound = new Sound(bgMusicPath, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
              console.error('[SoundManager] Failed to load background music:', error);
              rej(error);
            } else {
              console.log('[SoundManager] Background music loaded successfully');
              sound.setNumberOfLoops(-1); // Loop forever
              sound.setVolume(this.musicVolume);
              this.backgroundMusic = sound;
              // A small hack for Android to ensure music plays
              if (Platform.OS === 'android') {
                sound.play(() => sound.pause());
              }
              res(sound);
            }
          });
        });

        await Promise.all([...soundPromises, bgMusicPromise]);

        this.isInitialized = true;
        console.log('[SoundManager] Sound system fully initialized and ready.');
        resolve();
      } catch (error) {
        console.error('[SoundManager] Error initializing sounds:', error);
        reject(error);
      }
    });
  }

  // Play a sound effect
  async playSoundEffect(soundKey) {
    await this.initializationPromise;
    if (!this.soundEnabled || !this.sounds[soundKey]) {
      return;
    }

    try {
      const sound = this.sounds[soundKey];
      
      // Stop if already playing to allow rapid repeated plays
      if (sound.isPlaying()) {
        sound.stop(() => {
          sound.play((success) => {
            if (!success) {
              console.warn(`[SoundManager] Failed to play ${soundKey}`);
            }
          });
        });
      } else {
        sound.play((success) => {
          if (!success) {
            console.warn(`[SoundManager] Failed to play ${soundKey}`);
          }
        });
      }
    } catch (error) {
      console.error(`[SoundManager] Error playing ${soundKey}:`, error);
    }
  }

  // Play background music
  async playBackgroundMusic() {
    await this.initializationPromise;
    if (!this.musicEnabled || this.isMusicPlaying || !this.backgroundMusic) {
      return;
    }

    try {
      this.backgroundMusic.play((success) => {
        if (success) {
          console.log('[SoundManager] Background music started');
          this.isMusicPlaying = true;
        } else {
          console.warn('[SoundManager] Background music playback failed');
          this.isMusicPlaying = false;
        }
      });
    } catch (error) {
      console.error('[SoundManager] Error playing background music:', error);
    }
  }

  // Stop background music
  stopBackgroundMusic() {
    if (!this.backgroundMusic || !this.isMusicPlaying) {
      return;
    }

    try {
      this.backgroundMusic.pause();
      this.isMusicPlaying = false;
      console.log('[SoundManager] Background music stopped');
    } catch (error) {
      console.error('[SoundManager] Error stopping background music:', error);
    }
  }

  // Pause background music
  pauseBackgroundMusic() {
    if (!this.backgroundMusic || !this.isMusicPlaying) {
      return;
    }

    try {
      this.backgroundMusic.pause();
      this.isMusicPlaying = false;
      console.log('[SoundManager] Background music paused');
    } catch (error) {
      console.error('[SoundManager] Error pausing background music:', error);
    }
  }

  // Resume background music
  resumeBackgroundMusic() {
    if (!this.musicEnabled || !this.backgroundMusic || this.isMusicPlaying) {
      return;
    }

    try {
      this.backgroundMusic.play((success) => {
        if (success) {
          this.isMusicPlaying = true;
          console.log('[SoundManager] Background music resumed');
        }
      });
    } catch (error) {
      console.error('[SoundManager] Error resuming background music:', error);
    }
  }

  // Set music volume (0.0 to 1.0)
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.setVolume(this.musicVolume);
    }
    console.log(`[SoundManager] Music volume set to ${this.musicVolume}`);
  }

  // Set SFX volume (0.0 to 1.0)
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.setVolume(this.sfxVolume);
      }
    });
    console.log(`[SoundManager] SFX volume set to ${this.sfxVolume}`);
  }

  // Enable/disable all sounds
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    console.log(`[SoundManager] Sound effects ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Enable/disable music
  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled && this.isMusicPlaying) {
      this.stopBackgroundMusic();
    } else if (enabled && !this.isMusicPlaying) {
      this.playBackgroundMusic();
    }
    console.log(`[SoundManager] Background music ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Fade out background music
  fadeOutMusic(duration = 1000) {
    if (!this.backgroundMusic || !this.isMusicPlaying) {
      return;
    }

    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = this.musicVolume / steps;
    let currentVolume = this.musicVolume;
    
    const fadeInterval = setInterval(() => {
      currentVolume -= volumeStep;
      if (currentVolume <= 0) {
        this.backgroundMusic.setVolume(0);
        this.stopBackgroundMusic();
        clearInterval(fadeInterval);
        // Restore original volume
        setTimeout(() => {
          this.backgroundMusic.setVolume(this.musicVolume);
        }, 100);
      } else {
        this.backgroundMusic.setVolume(currentVolume);
      }
    }, stepDuration);
  }

  // Fade in background music
  fadeInMusic(duration = 1000) {
    if (!this.musicEnabled || !this.backgroundMusic) {
      return;
    }

    this.backgroundMusic.setVolume(0);
    this.playBackgroundMusic();

    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = this.musicVolume / steps;
    let currentVolume = 0;
    
    const fadeInterval = setInterval(() => {
      currentVolume += volumeStep;
      if (currentVolume >= this.musicVolume) {
        this.backgroundMusic.setVolume(this.musicVolume);
        clearInterval(fadeInterval);
      } else {
        this.backgroundMusic.setVolume(currentVolume);
      }
    }, stepDuration);
  }

  // Release all sounds (cleanup)
  releaseAllSounds() {
    try {
      Object.values(this.sounds).forEach(sound => {
        if (sound) {
          sound.release();
        }
      });

      if (this.backgroundMusic) {
        this.backgroundMusic.release();
      }

      this.sounds = {};
      this.backgroundMusic = null;
      this.isInitialized = false;
      this.isMusicPlaying = false;
      console.log('[SoundManager] All sounds released');
    } catch (error) {
      console.error('[SoundManager] Error releasing sounds:', error);
    }
  }

  // Get current state
  getState() {
    return {
      soundEnabled: this.soundEnabled,
      musicEnabled: this.musicEnabled,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      isMusicPlaying: this.isMusicPlaying,
      isInitialized: this.isInitialized,
    };
  }
}

// Create singleton instance
const soundManager = new SoundManager();

// Export convenience functions
export const playCorrectSound = () => soundManager.playSoundEffect('correct');
export const playIncorrectSound = () => soundManager.playSoundEffect('incorrect');
export const playLevelCompleteSound = () => soundManager.playSoundEffect('levelComplete');
export const playTapSound = () => soundManager.playSoundEffect('tap');

export const playBackgroundMusic = () => soundManager.playBackgroundMusic();
export const stopBackgroundMusic = () => soundManager.stopBackgroundMusic();
export const pauseBackgroundMusic = () => soundManager.pauseBackgroundMusic();
export const resumeBackgroundMusic = () => soundManager.resumeBackgroundMusic();

export const setMusicVolume = (volume) => soundManager.setMusicVolume(volume);
export const setSfxVolume = (volume) => soundManager.setSfxVolume(volume);
export const setSoundEnabled = (enabled) => soundManager.setSoundEnabled(enabled);
export const setMusicEnabled = (enabled) => soundManager.setMusicEnabled(enabled);

export const fadeOutMusic = (duration) => soundManager.fadeOutMusic(duration);
export const fadeInMusic = (duration) => soundManager.fadeInMusic(duration);

export const releaseAllSounds = () => soundManager.releaseAllSounds();
export const getSoundState = () => soundManager.getState();

// Export the singleton instance as default
export default soundManager;
