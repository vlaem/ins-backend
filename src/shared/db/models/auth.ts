import { DateTime } from 'luxon'
import CustomDataTypes from '~/shared/db/custom-data-types'
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  Sequelize,
} from '@sequelize/core'

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: string
  declare email: string
  declare password: string
  declare createdAt: DateTime
  declare updatedAt: DateTime
}
export class UserRefreshToken extends Model<
  InferAttributes<UserRefreshToken>,
  InferCreationAttributes<UserRefreshToken>
> {
  declare id: string
  declare userId: ForeignKey<string>
  declare expiresAt: DateTime
  declare createdAt: DateTime
}

export class Invite extends Model<
  InferAttributes<Invite>,
  InferCreationAttributes<Invite>
> {
  declare id: string
  declare expiresAt: DateTime
  declare createdAt: DateTime
}

export function init(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: CustomDataTypes.DATETIME,
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      schema: 'auth',
    }
  )

  UserRefreshToken.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      expiresAt: {
        type: CustomDataTypes.DATETIME,
        allowNull: false,
      },
      createdAt: {
        type: CustomDataTypes.DATETIME,
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      schema: 'auth',
    }
  )

  Invite.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      expiresAt: {
        type: CustomDataTypes.DATETIME,
        allowNull: false,
      },
      createdAt: {
        type: CustomDataTypes.DATETIME,
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      schema: 'auth',
    }
  )

  User.hasMany(UserRefreshToken, {
    foreignKey: 'userId',
  })
}
