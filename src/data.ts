
import { logger } from './logger';
import {
    DataEntityRepository,
    DataUniqueNameRepository,
    EntityDataMapper,
    UniqueNameDataMapper,
    DynamoEntityStore,
    DynamoUniqueNameStore,
    dynamoConfig,
    dynamoCreateTables,
    // RedisKeyringStore,
    DynamoKeyringStore
} from 'entitizer.data';

import { Entitizer } from 'entitizer';

export { Context } from 'entitizer';

export const entityRepository = new DataEntityRepository(new DynamoEntityStore(), new EntityDataMapper());
export const uniqueNameRepository = new DataUniqueNameRepository(new DynamoUniqueNameStore(new DynamoKeyringStore()), new UniqueNameDataMapper());

export const entitizer = new Entitizer(entityRepository, uniqueNameRepository);
if (process.env.LOCAL_DB) {
    dynamoConfig({ region: 'dynamodb-local-frankfurt', endpoint: 'http://localhost:8000', accessKeyId: 'id', secretAccessKey: 'key' });
}
dynamoCreateTables().catch(e => logger.error(e));
