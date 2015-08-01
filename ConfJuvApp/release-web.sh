#!/bin/bash
zip -r builds/confjuvapp-web.zip www/
scp -r www/* confjuvapp-test-server:www/
