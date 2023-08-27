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
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
      },
      {}
    )
    await queryInterface.createTable(
      {
        schema: 'auth',
        tableName: 'user_refresh_tokens',
      },
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            table: 'users',
            key: 'id',
          },
        },
        expires_at: DataTypes.DATE,
        created_at: DataTypes.DATE,
      }
    )
    await queryInterface.createTable(
      {
        schema: 'auth',
        tableName: 'invites',
      },
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        expires_at: DataTypes.DATE,
        created_at: DataTypes.DATE,
      }
    )
  })
}

export function down(queryInterface: AbstractQueryInterface) {
  return queryInterface.sequelize.transaction(async () => {
    await queryInterface.dropTable({ schema: 'auth', tableName: 'users' })
    await queryInterface.dropTable({
      schema: 'auth',
      tableName: 'user_refresh_tokens',
    })
    await queryInterface.dropTable({
      schema: 'auth',
      tableName: 'invites',
    })

    await queryInterface.dropSchema('auth')
  })
}
