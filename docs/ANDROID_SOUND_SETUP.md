# Sound System Fix - Android Asset Setup

## Issue
React Native Sound library requires sound files to be in platform-specific locations:
- **Android**: `android/app/src/main/res/raw/` (without .mp3 extension in code)
- **iOS**: Xcode project bundle (with .mp3 extension in code)

## Fix Applied

### 1. Created Android Raw Resources Directory
```bash
mkdir -p android/app/src/main/res/raw
```

### 2. Copied Sound Files to Android
```bash
cp src/assets/sounds/*.mp3 android/app/src/main/res/raw/
```

Files copied:
- `background_music.mp3`
- `correct.mp3`
- `incorrect.mp3`
- `level_complete.mp3`
- `tap.mp3`

### 3. Updated SoundManager.js

Added platform detection:
```javascript
import { Platform } from 'react-native';

const getSoundPath = (filename) => {
  // Android: remove .mp3 extension (loads from res/raw/)
  // iOS: keep .mp3 extension (loads from bundle)
  return Platform.OS === 'android' ? filename.replace('.mp3', '') : filename;
};
```

Updated sound loading to use platform-specific paths:
```javascript
const soundPath = getSoundPath('correct.mp3');
// Android: 'correct' → loads from res/raw/correct.mp3
// iOS: 'correct.mp3' → loads from bundle
```

## For iOS Setup (when needed)

1. Open Xcode project:
   ```bash
   open ios/ChefsQuest.xcworkspace
   ```

2. Drag sound files from `src/assets/sounds/` into Xcode project
3. Select:
   - ✅ Copy items if needed
   - ✅ Add to targets: ChefsQuest

## Rebuild Required

After adding sound files to Android raw resources, rebuild the app:

```bash
# Clean build
cd android && ./gradlew clean && cd ..

# Rebuild app
npm run android

# OR restart Metro with cache reset
npx react-native start --reset-cache
```

## Testing Checklist

- [ ] Sound effects play (correct, incorrect, tap, level complete)
- [ ] Background music plays and loops
- [ ] Volume controls work in Settings
- [ ] Sounds persist after app restart
- [ ] No console errors about failed sound loading
- [ ] Sounds work on both Android and iOS (when iOS is set up)

## Files Modified

1. `/android/app/src/main/res/raw/` - Added 5 MP3 files
2. `/src/utils/SoundManager.js` - Added Platform detection and getSoundPath helper

## Why This Was Needed

React Native Sound uses native platform APIs:
- **Android MediaPlayer** requires files in `res/raw/` directory
- **iOS AVAudioPlayer** loads from app bundle
- File paths differ between platforms (extension vs no extension)

Our solution uses `Platform.OS` to automatically select the correct path format.

## Prevention

For future sound additions:
1. Add MP3 to `src/assets/sounds/`
2. Copy to `android/app/src/main/res/raw/`
3. Add to iOS Xcode project
4. Update SoundManager soundFiles object
5. Rebuild both platforms

## Related Documentation

- [React Native Sound - GitHub](https://github.com/zmxv/react-native-sound)
- [Android Raw Resources](https://developer.android.com/guide/topics/resources/providing-resources#OriginalFiles)
- [iOS Bundle Resources](https://developer.apple.com/library/archive/documentation/CoreFoundation/Conceptual/CFBundles/AboutBundles/AboutBundles.html)
