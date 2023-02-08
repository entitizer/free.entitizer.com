#!/bin/bash

#update repository
git pull
yarn
yarn tsc
pm2 restart ./pm2.json
