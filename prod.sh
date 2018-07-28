#!/bin/bash

yarn unlink @textactor/domain
yarn unlink @textactor/ner
yarn unlink @textactor/wikientity-data
yarn unlink @textactor/wikientity-domain
yarn unlink @textactor/actor-data

yarn add @textactor/domain
yarn add @textactor/ner
yarn add @textactor/wikientity-data
yarn add @textactor/wikientity-domain
yarn add @textactor/actor-data

yarn tsc
