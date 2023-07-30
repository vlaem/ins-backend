import { DateTime } from 'luxon'
import CustomDataTypes from 'src/shared/db/custom-data-types'
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from '@sequelize/core'
import {
  Attribute,
  PrimaryKey,
  NotNull,
  Table,
  BelongsTo,
  Unique,
} from '@sequelize/core/decorators-legacy'

@Table({ schema: 'auth', underscored: true, tableName: 'users' })
export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  @Attribute(DataTypes.UUIDV4)
  @PrimaryKey
  declare id: string

  @Attribute(DataTypes.STRING)
  @NotNull
  @Unique
  declare email: string

  @Attribute(DataTypes.STRING)
  @NotNull
  declare password: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

@Table({
  schema: 'auth',
  underscored: true,
  tableName: 'user_refresh_tokens',
  updatedAt: false,
})
export class UserRefreshTokenModel extends Model<
  InferAttributes<UserRefreshTokenModel>,
  InferCreationAttributes<UserRefreshTokenModel>
> {
  @Attribute(DataTypes.STRING)
  @PrimaryKey
  declare id: string

  @Attribute(DataTypes.UUIDV4)
  @NotNull
  declare userId: string

  @BelongsTo(() => UserModel, 'userId')
  declare user: NonAttribute<UserModel>

  @Attribute(CustomDataTypes.DateTime)
  @NotNull
  declare expiresAt: DateTime

  declare createdAt: CreationOptional<Date>
}

@Table({
  schema: 'auth',
  underscored: true,
  tableName: 'link_invites',
  updatedAt: false,
})
export class InviteModel extends Model<
  InferAttributes<InviteModel>,
  InferCreationAttributes<InviteModel>
> {
  @Attribute(DataTypes.STRING)
  @PrimaryKey
  declare id: string

  @Attribute(CustomDataTypes.DateTime)
  @NotNull
  declare expiresAt: DateTime

  declare createdAt: CreationOptional<Date>
}
