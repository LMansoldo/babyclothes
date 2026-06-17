import type { ICatalogRepository } from '$lib/domain/catalog/repositories/ICatalogRepository';
import type { Filter } from '$lib/domain/catalog/value-objects/Filter';
import type { Item } from '$lib/domain/item/entities/Item';

export class FetchCatalog {
  constructor(private readonly catalog: ICatalogRepository) {}

  async execute(filter: Filter): Promise<Item[]> {
    return this.catalog.fetch(filter);
  }
}
