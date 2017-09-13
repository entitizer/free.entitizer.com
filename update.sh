#!/bin/bash

#update repository
git pull
npm install
tsc
pm2 restart ./pm2.json
