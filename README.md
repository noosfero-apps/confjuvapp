ConfJuvApp
==========

Aplicativo da 3a Conferência Nacional da Juventude: Como você vai mudar o Brasil?  

# A inovação na participação social em construção

Esse aplicativo é beta e já está em operação. Nos dias do seu lançamento já recebeu dezenas de propostas da Juventude Brasileira com energia pra mudar o Brasil. Pela primeira vez na história das conferências nacionais, um aplicativo web elegerá delegados e propostas baseado num sistema de pontuação que premia a relevância na rede. Com essa aplicativo damos um passo importante para mudar a participação social.

# Vem construir com a gente?

A gente faz aberto, a gente faz colaborativo. Para contribuir com a 3a Conferência da Juventude e com a Participação Social você pode:

1. Registrar um bug ou uma sugestão: [Página das "issues"](https://gitlab.com/participa/confjuvapp/issues), basta clicar em "+New Issue"
2. Contribuir com código, fazendo melhorias, vamos avaliar com carinho os seus "merge requests" ;-)

Tá esperando o que? Faz um fork e vem ajudar mudar a participação social no Brasil!

# Informações técnicas (em inglês para facilitar a cooperação internacional)

An hybric mobile application for "III Conferência Nacional da Juventude".

## Installation

This application is built on top of Ionic, so you need this framework.

1. Make sure you have Node.js installed
2. `npm install -g cordova ionic gulp gulp-util gulp-concat gulp-sass gulp-minify-css gulp-rename bower shelljs`
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