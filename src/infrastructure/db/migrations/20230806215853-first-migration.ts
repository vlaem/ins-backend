import { DataTypes, AbstractQueryInterface } from '@sequelize/core'

export function up(queryInterface: AbstractQueryInterface) {
  return queryInterface.sequelize.transaction(async () => {
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    })
    await queryInterface.createTable('user_refresh_tokens', {
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
      issued_at: DataTypes.DATE,
      expires_at: DataTypes.DATE,
    })
    await queryInterface.createTable('invites', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      expires_at: DataTypes.DATE,
      created_at: DataTypes.DATE,
    })
  })
}

export function down(queryInterface: AbstractQueryInterface) {
  return queryInterface.sequelize.transaction(async () => {
    await queryInterface.dropTable('users')
    await queryInterface.dropTable('user_refresh_tokens')
    await queryInterface.dropTable('invites')
  })
}
