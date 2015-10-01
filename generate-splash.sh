#!/bin/bash

# Original splash
img='resources/splash.png'

# Splash for Android
convert $img -resize 800x480   'resources/android/splash/drawable-land-hdpi-screen.png'
convert $img -resize 320x200   'resources/android/splash/drawable-land-ldpi-screen.png'
convert $img -resize 480x320   'resources/android/splash/drawable-land-mdpi-screen.png'
convert $img -resize 1280x720  'resources/android/splash/drawable-land-xhdpi-screen.png'
convert $img -resize 1600x960  'resources/android/splash/drawable-land-xxhdpi-screen.png'
convert $img -resize 1920x1280 'resources/android/splash/drawable-land-xxxhdpi-screen.png'
convert $img -resize 480x800   'resources/android/splash/drawable-port-hdpi-screen.png'
convert $img -resize 200x320   'resources/android/splash/drawable-port-ldpi-screen.png'
convert $img -resize 320x480   'resources/android/splash/drawable-port-mdpi-screen.png'
convert $img -resize 720x1280  'resources/android/splash/drawable-port-xhdpi-screen.png'
convert $img -resize 960x1600  'resources/android/splash/drawable-port-xxhdpi-screen.png'
convert $img -resize 1280x1920 'resources/android/splash/drawable-port-xxxhdpi-screen.png'

# Splash for iOS
convert $img -resize 640x960   'resources/ios/splash/Default@2x~iphone.png'
convert $img -resize 640x1136  'resources/ios/splash/Default-568h@2x~iphone.png'
convert $img -resize 750x1334  'resources/ios/splash/Default-667h.png'
convert $img -resize 1242x2208 'resources/ios/splash/Default-736h.png'
convert $img -resize 320x480   'resources/ios/splash/Default~iphone.png'
convert $img -resize 2048x1536 'resources/ios/splash/Default-Landscape@2x~ipad.png'
convert $img -resize 2208x1242 'resources/ios/splash/Default-Landscape-736h.png'
convert $img -resize 1024x768  'resources/ios/splash/Default-Landscape~ipad.png'
convert $img -resize 1536x2048 'resources/ios/splash/Default-Portrait@2x~ipad.png'
convert $img -resize 768x1024  'resources/ios/splash/Default-Portrait~ipad.png'
