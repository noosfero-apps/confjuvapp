#!/bin/bash
# Generates APK ready for Play Store
# Remember to increment the "version" value in config.xml when generating a new release
#cordova plugin rm org.apache.cordova.console
#cordova build --release android
#jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore confjuvapp-key.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk confjuvapp_key
zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk confjuvapp.apk
mv confjuvapp.apk builds/confjuvapp-live.apk
echo "Now upload builds/confjuvapp-live.apk to Play Store"
