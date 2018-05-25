#!/bin/bash

yarn unlink @textactor/ner
yarn unlink @textactor/wikientity-data
yarn unlink @textactor/actor-data

yarn add @textactor/ner
yarn add @textactor/wikientity-data
yarn add @textactor/actor-data

yarn tsc
