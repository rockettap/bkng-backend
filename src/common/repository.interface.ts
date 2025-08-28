export interface Repository<T, U = number> {
  findById(id: U): Promise<T | null>;
  create(entity: T): Promise<T>;
  // update(entity: T): Promise<T>;
  // delete(entity: T): Promise<boolean>;
}
