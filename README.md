ConfJuvApp
==========

An hybric mobile application for "III Conferência Nacional da Juventude".

## Installation

This application is built on top of Ionic, so you need this framework.

1. Make sure you have Node.js installed
2. `npm install -g cordova ionic`
3. `cd confjuvapp`
4. `ionic build (android|ios)`
5. `ionic emulate (android|ios)`

In order to compile the theme, you need to run: `gulp sass`

You need to configure the application by creating a file `www/js/config.js` based on `www/js/config.js.example`.
