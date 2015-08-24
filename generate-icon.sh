#!/bin/bash

# Original icon
img='www/img/avatar.png'

# General icon
cp $img resources/

# Icons for Android
convert $img -resize 72x72   'resources/android/icon/drawable-hdpi-icon.png'    
convert $img -resize 36x36   'resources/android/icon/drawable-ldpi-icon.png'    
convert $img -resize 48x48   'resources/android/icon/drawable-mdpi-icon.png'    
convert $img -resize 96x96   'resources/android/icon/drawable-xhdpi-icon.png'   
convert $img -resize 144x144 'resources/android/icon/drawable-xxhdpi-icon.png'  
convert $img -resize 192x192 'resources/android/icon/drawable-xxxhdpi-icon.png' 

# Icons for iOS
convert $img -resize 114x114 'resources/ios/icon/icon@2x.png'        
convert $img -resize 80x80   'resources/ios/icon/icon-40@2x.png'     
convert $img -resize 40x40   'resources/ios/icon/icon-40.png'        
convert $img -resize 100x100 'resources/ios/icon/icon-50@2x.png'     
convert $img -resize 50x50   'resources/ios/icon/icon-50.png'        
convert $img -resize 120x120 'resources/ios/icon/icon-60@2x.png'     
convert $img -resize 180x180 'resources/ios/icon/icon-60@3x.png'     
convert $img -resize 60x60   'resources/ios/icon/icon-60.png'        
convert $img -resize 144x144 'resources/ios/icon/icon-72@2x.png'     
convert $img -resize 72x72   'resources/ios/icon/icon-72.png'        
convert $img -resize 152x152 'resources/ios/icon/icon-76@2x.png'     
convert $img -resize 76x76   'resources/ios/icon/icon-76.png'        
convert $img -resize 57x57   'resources/ios/icon/icon.png'           
convert $img -resize 58x58   'resources/ios/icon/icon-small@2x.png'  
convert $img -resize 87x87   'resources/ios/icon/icon-small@3x.png'  
convert $img -resize 29x29   'resources/ios/icon/icon-small.png'     
