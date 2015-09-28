#!/bin/bash
rm -rf platforms/ios
ionic platform add ios
ionic build ios
sed -i ':a;N;$!ba;s/<\/dict>\n<\/plist>/  <key>NSAppTransportSecurity<\/key>\n    <dict>\n      <key>NSAllowsArbitraryLoads<\/key>\n      <true\/>\n    <\/dict>\n  <\/dict>\n<\/plist>/g' 'platforms/ios/#3ConfJuv/#3ConfJuv-Info.plist'
echo 'Now open platforms/ios/#3ConfJuv.xcodeproj on XCode and continue from there'
