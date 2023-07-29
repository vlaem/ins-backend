import { FindOptions, InferAttributes, Model } from '@sequelize/core'

export interface GenericRepository<T, K extends Model> {
  findOne(
    options?: FindOptions<InferAttributes<K, { omit: never }>> | undefined
  ): Promise<T | null>
  add(domainModel: T): Promise<void>
  update(domainModel: T): Promise<void>
  updateAll(domainModels: T[]): Promise<void>
}
