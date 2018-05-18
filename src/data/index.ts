
import { ActorRepository, ActorModel, ActorNameModel, ActorNameRepository } from '@textactor/actor-data';
import { Extractor } from '@textactor/ner';
import { CacheWikiEntityRepository } from './wikiEntityRepository';
import { WikiEntityModel } from '@textactor/wikientity-data';

const actorRepository = new ActorRepository(new ActorModel());
const actorNameRepository = new ActorNameRepository(new ActorNameModel());

export const extractor = new Extractor(actorRepository, actorNameRepository);
export const wikiEntityRepository = new CacheWikiEntityRepository(new WikiEntityModel());
