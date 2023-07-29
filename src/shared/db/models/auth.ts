import { DateTime } from 'luxon'
import CustomDataTypes from 'src/shared/db/custom-data-types'
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
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

@Table({ schema: 'auth', underscored: true, tableName: 'user_refresh_tokens' })
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

  @BelongsTo(() => UserModel, 'id')
  declare user: UserModel

  @Attribute(CustomDataTypes.DateTime)
  @NotNull
  declare expiresAt: DateTime

  declare createdAt: CreationOptional<Date>
}

@Table({ schema: 'auth', underscored: true, tableName: 'link_invites' })
export class LinkInviteModel extends Model<
  InferAttributes<LinkInviteModel>,
  InferCreationAttributes<LinkInviteModel>
> {
  @Attribute(DataTypes.STRING)
  @PrimaryKey
  declare id: string

  @Attribute(CustomDataTypes.DateTime)
  @NotNull
  declare expiresAt: DateTime

  declare createdAt: CreationOptional<Date>
}
