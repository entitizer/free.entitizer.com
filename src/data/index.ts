
import { ActorNameRepositoryBuilder, ActorRepositoryBuilder } from '@textactor/actor-data';
import { Extractor } from '@textactor/ner';
import { CacheWikiEntityRepository } from './wiki-entity-repository';
import { WikiEntityRepositoryBuilder } from '@textactor/wikientity-data';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import { MongoClient } from 'mongodb';
import { LearningTextRepository } from '@textactor/concept-domain';
import { LearningTextRepositoryBuilder } from '@textactor/concept-data';

const dynamoDbClient = new DynamoDB.DocumentClient();

const actorRepository = ActorRepositoryBuilder.build(dynamoDbClient);
const actorNameRepository = ActorNameRepositoryBuilder.build(dynamoDbClient);

export const extractor = new Extractor(actorRepository, actorNameRepository);
export const wikiEntityRepository = new CacheWikiEntityRepository(WikiEntityRepositoryBuilder.build(dynamoDbClient));

let mongoClient: MongoClient;
export let learningTextRepository: LearningTextRepository;

export async function initData() {
    mongoClient = await MongoClient.connect(process.env.CONCEPT_DB);
    learningTextRepository = LearningTextRepositoryBuilder.build(mongoClient.db());
    await learningTextRepository.createStorage();
}