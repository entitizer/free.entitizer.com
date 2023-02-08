import { WikiEntity, WikiEntityRepository } from "@textactor/wikientity-domain";
import { RepositoryUpdateData } from "@textactor/domain";

export class CacheWikiEntityRepository implements WikiEntityRepository {
  constructor(private rep: WikiEntityRepository) {}

  createOrUpdate(item: WikiEntity) {
    return this.rep.createOrUpdate(item);
  }

  delete(id: string) {
    return this.rep.delete(id);
  }

  create(data: WikiEntity) {
    return this.rep.create(data);
  }

  update(data: RepositoryUpdateData<WikiEntity>) {
    return this.rep.update(data);
  }

  exists(id: string) {
    return this.rep.exists(id);
  }

  deleteStorage() {
    return this.rep.deleteStorage();
  }

  createStorage() {
    return this.rep.createStorage();
  }

  getById(id: string): Promise<WikiEntity> {
    return this.rep.getById(id);
  }

  getByIds(ids: string[]): Promise<WikiEntity[]> {
    return this.rep.getByIds(ids);
  }
}
