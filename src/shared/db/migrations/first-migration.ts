import { DataTypes, AbstractQueryInterface } from '@sequelize/core'

export function up(queryInterface: AbstractQueryInterface) {
  return queryInterface.sequelize.transaction(async () => {
    await queryInterface.createSchema('auth')

    await queryInterface.createTable(
      {
        schema: 'auth',
        tableName: 'users',
      },
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
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {}
    )
    await queryInterface.createTable(
      {
        schema: 'auth',
        tableName: 'user-refresh-tokens',
      },
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            table: 'users',
            key: 'id',
          },
        },
        expiresAt: DataTypes.DATE,
        createdAt: DataTypes.DATE,
      }
    )
    await queryInterface.createTable(
      {
        schema: 'auth',
        tableName: 'link-invites',
      },
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        expiresAt: DataTypes.DATE,
        createdAt: DataTypes.DATE,
      }
    )
  })
}

export function down(queryInterface: AbstractQueryInterface) {
  return queryInterface.sequelize.transaction(async () => {
    await queryInterface.dropTable({ schema: 'auth', tableName: 'users' })
    await queryInterface.dropTable({
      schema: 'auth',
      tableName: 'user-refresh-tokens',
    })
    await queryInterface.dropTable({
      schema: 'auth',
      tableName: 'link-invites',
    })

    await queryInterface.dropSchema('auth')
  })
}
