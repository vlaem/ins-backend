import { DateTime } from 'luxon'
import CustomDataTypes from 'src/shared/db/custom-data-types'
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
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

@Table({
  schema: 'auth',
  underscored: true,
  tableName: 'users',
  timestamps: false,
})
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

  @Attribute(CustomDataTypes.DateTime)
  @NotNull
  declare createdAt: DateTime

  @Attribute(CustomDataTypes.DateTime)
  @NotNull
  declare updatedAt: DateTime
}

@Table({
  schema: 'auth',
  underscored: true,
  tableName: 'user_refresh_tokens',
  timestamps: false,
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

  @Attribute(CustomDataTypes.DateTime)
  @NotNull
  declare createdAt: DateTime
}

@Table({
  schema: 'auth',
  underscored: true,
  tableName: 'link_invites',
  timestamps: false,
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

  @Attribute(CustomDataTypes.DateTime)
  @NotNull
  declare createdAt: DateTime
}
