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

In order to compile the theme, you need to run: `gulp sass` or `./sass.sh` in order to have it updated periodically

You need to configure the application by creating a file `www/js/config.js` based on `www/js/config.js.example`.

## Connecting to Noosfero

One way to connect with Noosfero API is to set the `Access-Control-Allow-Origin` header on the Noosfero side and thus allow connections.

Another way is to set a reverse proxy on a webserver in front of Noosfero. For example, let's assume there is
a host called `confjuv`. If you have the following Apache configuration for this site, you can access the front-end
by going to http://confjuv/www and any other request path will be forwarded to Noosfero running on `localhost:3000`:

```apache
<VirtualHost *:80>
  ServerName confjuv
  DocumentRoot /var/www/confjuvapp # This is the ConfJuvApp directory inside this repository
  ProxyPass /www !
  ProxyPass / http://localhost:3000/
  ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```
