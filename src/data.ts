
import { ActorRepository, ActorModel, ActorNameModel, ActorNameRepository } from '@textactor/actor-data';
import { Extractor } from '@textactor/ner';

const actorRepository = new ActorRepository(new ActorModel());
const actorNameRepository = new ActorNameRepository(new ActorNameModel());

export const extractor = new Extractor(actorRepository, actorNameRepository);
