
import { WikiEntityRepository } from '@textactor/wikientity-data';
import { WikiEntity } from '@textactor/wikientity-domain';

export class CacheWikiEntityRepository extends WikiEntityRepository {
    getById(id: string): Promise<WikiEntity> {
        return super.getById(id);
    }
    getByIds(ids: string[]): Promise<WikiEntity[]> {
        return super.getByIds(ids);
    }
}

