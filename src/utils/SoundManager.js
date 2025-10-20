import Sound from 'react-native-sound';

Sound.setCategory('Playback');

const playSound = (soundFile) => {
  const sound = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
    sound.play((success) => {
      if (!success) {
        console.log('playback failed due to audio decoding errors');
      }
      sound.release();
    });
  });
};

export const playCorrectSound = () => playSound('correct.mp3');
export const playIncorrectSound = () => playSound('incorrect.mp3');
export const playLevelCompleteSound = () => playSound('level_complete.mp3');
export const playTapSound = () => playSound('tap.mp3');

let backgroundMusic;

export const playBackgroundMusic = () => {
  backgroundMusic = new Sound('background_music.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
    backgroundMusic.setNumberOfLoops(-1);
    backgroundMusic.play((success) => {
      if (!success) {
        console.log('playback failed due to audio decoding errors');
      }
    });
  });
};

export const stopBackgroundMusic = () => {
  if (backgroundMusic) {
    backgroundMusic.stop(() => {
      backgroundMusic.release();
      backgroundMusic = null;
    });
  }
};
