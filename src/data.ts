
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

import { RepAccessOptions } from 'entitizer.entities';

import { Entitizer } from 'entitizer';

export { Context } from 'entitizer';

const OPTIONS = { fields: ['id', 'type', 'name', 'description', 'wikiTitle', 'cc2', 'lang', 'abbr', 'types', 'rank', 'extract'] };

class LocalDataEntityRepository extends DataEntityRepository {
    getByIds(ids: string[], options?: RepAccessOptions) {
        options = options || OPTIONS;
        return super.getByIds(ids, options);
    }
    getById(id: string, options?: RepAccessOptions) {
        options = options || OPTIONS;
        return super.getById(id, options);
    }
}

export const entityRepository = new LocalDataEntityRepository(new DynamoEntityStore(), new EntityDataMapper());
export const uniqueNameRepository = new DataUniqueNameRepository(new DynamoUniqueNameStore(new DynamoKeyringStore()), new UniqueNameDataMapper());

export const entitizer = new Entitizer(entityRepository, uniqueNameRepository);
if (process.env.LOCAL_DB) {
    dynamoConfig({ region: 'dynamodb-local-frankfurt', endpoint: 'http://localhost:8000', accessKeyId: 'id', secretAccessKey: 'key' });
}
dynamoCreateTables().catch(e => logger.error(e));
