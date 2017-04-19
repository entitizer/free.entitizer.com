
import { Promise } from './utils';
import { logger } from './logger';
import { EntityManager, storage, keyring, EntityExtractor } from 'entitizer.entities';
import { Entity, PlainObject } from 'entitizer.models';

const redis = require('redis');

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASS
});

// const dynamoStorage = new keyring.DynamoStorage([process.env.ENTITIZER_TABLE_PREFIX, 'NamesKeyring'].join('_'));
const redisStorage = new keyring.RedisStorage(client);
const namekeyring = new keyring.NameKeyring(redisStorage);
const entityStorage = new storage.EntityStorage();
// const entityNamesStorage = new storage.EntityNamesStorage();
// const manager = new EntityManager(namekeyring, entityStorage, entityNamesStorage);
const extractor = new EntityExtractor(namekeyring, entityStorage);

export type Context = {
    text: string
    lang: string
    country?: string
}

export function extractEntities(context: Context) {
    return extractor.extract(context);
}

export function isValidLanguage(lang: string) {
    return ['ro', 'ru', 'bg'].indexOf(lang) > -1;
}

export function close() {
    return client.quitAsync();
}


// function init() {
//     return Promise.props({
//         // p1: dynamoStorage.createTable(),
//         p2: storage.createTables()
//     });
// }

// init().catch((e) => logger.error(e));
