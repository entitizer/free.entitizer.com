#!/bin/bash

yarn remove @textactor/ner
yarn remove @textactor/wikientity-data
yarn remove @textactor/actor-data

yarn link @textactor/ner
yarn link @textactor/wikientity-data
yarn link @textactor/actor-data

yarn tsc
