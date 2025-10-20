# Android Release Build Guide

## Overview
This guide explains how to build and publish release versions of ChefsQuest for Android.

## Prerequisites
- Node.js and npm installed
- Android Studio with SDK installed
- Java JDK 11 or higher

## Release Keystore Configuration

### Current Configuration
The release keystore has been generated and configured:

- **Keystore File**: `android/app/chefsquest-release-key.keystore`
- **Alias**: `chefsquest-key-alias`
- **Store Password**: `chefsquest123`
- **Key Password**: `chefsquest123`

⚠️ **SECURITY WARNING**: The current passwords are placeholder values. For production use, you should:
1. Generate a new keystore with strong passwords
2. Store passwords securely (never commit to version control)
3. Use environment variables or a secure secrets management system

### Keystore Details
- **Key Type**: RSA 2048-bit
- **Validity**: 10,000 days (~27 years)
- **Algorithm**: SHA256withRSA

## Building Release APK

### 1. Clean Previous Builds
```bash
cd android
./gradlew clean
cd ..
```

### 2. Build Release APK
```bash
cd android
./gradlew assembleRelease
```

The APK will be generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### 3. Install Release APK on Device
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Building Release AAB (Android App Bundle)

For Google Play Store distribution, use AAB format:

```bash
cd android
./gradlew bundleRelease
```

The AAB will be generated at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## NPM Scripts

You can add these to your `package.json` for convenience:

```json
{
  "scripts": {
    "android:clean": "cd android && ./gradlew clean",
    "android:release": "cd android && ./gradlew assembleRelease",
    "android:bundle": "cd android && ./gradlew bundleRelease",
    "android:install-release": "cd android && ./gradlew installRelease"
  }
}
```

## Version Management

Update version in `android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.chefsquest"
    versionCode 1        // Increment for each release
    versionName "1.0.0"  // Update semantic version
}
```

### Version Code Strategy
- Increment `versionCode` by 1 for each release to Play Store
- Update `versionName` following semantic versioning (MAJOR.MINOR.PATCH)

## Build Variants

### Debug Build
```bash
./gradlew assembleDebug
```

### Release Build (Signed)
```bash
./gradlew assembleRelease
```

### Check Build Type
The release build will:
- Enable ProGuard (if configured)
- Shrink resources
- Optimize code
- Sign with release keystore

## Testing Release Build

Before publishing, thoroughly test the release build:

1. **Install on physical device**:
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

2. **Test all features**:
   - Game mechanics (ingredient selection, progress tracking)
   - Level progression (all 100 levels)
   - Sound effects and haptics
   - Settings persistence
   - Android system bar behavior
   - Navigation flow

3. **Performance testing**:
   - Check app size
   - Monitor memory usage
   - Test on different Android versions
   - Test on various screen sizes

## Troubleshooting

### Build Fails with Keystore Error
```
Execution failed for task ':app:packageRelease'.
> A failure occurred while executing com.android.build.gradle.internal.tasks.Workers$ActionFacade
  > Keystore file not found
```

**Solution**: Ensure `chefsquest-release-key.keystore` exists in `android/app/` directory.

### Gradle Build Error
```bash
cd android
./gradlew clean
./gradlew assembleRelease --stacktrace
```

### ProGuard Issues
If you encounter ProGuard errors, add keep rules to `android/app/proguard-rules.pro`:

```proguard
# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep your app's classes
-keep class com.chefsquest.** { *; }
```

## Google Play Store Preparation

### 1. App Signing by Google Play
When uploading to Play Store for the first time:
- Google will manage your app signing key
- Use the generated AAB (not APK)
- Keep your upload key secure

### 2. Required Assets
- **App Icon**: 512x512 PNG
- **Feature Graphic**: 1024x500 PNG
- **Screenshots**: At least 2 (phone and/or tablet)
- **Privacy Policy**: URL to privacy policy

### 3. Store Listing
Prepare:
- App title: "Chef's Quest"
- Short description (80 chars)
- Full description (4000 chars)
- Category: Games > Puzzle
- Content rating questionnaire

### 4. Release Track
Start with:
- **Internal Testing**: For team testing
- **Closed Testing**: For beta testers
- **Open Testing**: For public beta
- **Production**: For all users

## Security Best Practices

### For Production Release:

1. **Generate New Keystore**:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 \
     -keystore chefsquest-production.keystore \
     -alias chefsquest-prod-key \
     -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Secure Password Storage**:
   - Use environment variables
   - Never commit keystore or passwords to git
   - Store backup keystore securely

3. **Update gradle.properties**:
   ```properties
   MYAPP_UPLOAD_STORE_FILE=chefsquest-production.keystore
   MYAPP_UPLOAD_KEY_ALIAS=chefsquest-prod-key
   MYAPP_UPLOAD_STORE_PASSWORD=<your-secure-password>
   MYAPP_UPLOAD_KEY_PASSWORD=<your-secure-password>
   ```

4. **Add to .gitignore**:
   ```
   # Keystores
   *.keystore
   *.jks
   
   # Sensitive properties
   keystore.properties
   ```

## Build Optimization

### Enable ProGuard
In `android/app/build.gradle`:
```gradle
def enableProguardInReleaseBuilds = true
```

### Reduce APK Size
- Enable ProGuard/R8
- Use AAB format (Google Play)
- Enable resource shrinking
- Use WebP images instead of PNG
- Remove unused resources

### Multi-APK Support
For different architectures:
```gradle
android {
    splits {
        abi {
            enable true
            reset()
            include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
            universalApk true
        }
    }
}
```

## Next Steps

1. **Test release build thoroughly**
2. **Update version numbers** before each release
3. **Create release notes** documenting changes
4. **Upload to Google Play Console**
5. **Submit for review**

## Support

For issues or questions:
- Check React Native documentation: https://reactnative.dev/docs/signed-apk-android
- Review Android publishing guide: https://developer.android.com/studio/publish
