#!/bin/bash

yarn remove @textactor/domain
yarn remove @textactor/ner
yarn remove @textactor/wikientity-data
yarn remove @textactor/wikientity-domain
yarn remove @textactor/actor-data

yarn link @textactor/domain
yarn link @textactor/ner
yarn link @textactor/wikientity-data
yarn link @textactor/wikientity-domain
yarn link @textactor/actor-data

yarn tsc
