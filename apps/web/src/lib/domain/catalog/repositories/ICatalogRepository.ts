import type { Item } from '../../item/entities/Item';
import type { Filter } from '../value-objects/Filter';

export interface ICatalogRepository {
  fetch(filter: Filter): Promise<Item[]>;
}
