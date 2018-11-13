
import { ActorNameRepositoryBuilder, ActorRepositoryBuilder } from '@textactor/actor-data';
import { Extractor } from '@textactor/ner';
import { CacheWikiEntityRepository } from './wiki-entity-repository';
import { WikiEntityRepositoryBuilder } from '@textactor/wikientity-data';
import DynamoDB = require('aws-sdk/clients/dynamodb');

const dynamoDbClient = new DynamoDB.DocumentClient();

const actorRepository = ActorRepositoryBuilder.build(dynamoDbClient);
const actorNameRepository = ActorNameRepositoryBuilder.build(dynamoDbClient);

export const extractor = new Extractor(actorRepository, actorNameRepository);
export const wikiEntityRepository = new CacheWikiEntityRepository(WikiEntityRepositoryBuilder.build(dynamoDbClient));
