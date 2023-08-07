import { DataTypes, AbstractQueryInterface } from '@sequelize/core'

export function up(queryInterface: AbstractQueryInterface) {
  return queryInterface.sequelize.transaction(async () => {
    await queryInterface.addColumn(
      {
        schema: 'auth',
        tableName: 'users',
      },
      'firebase_uid',
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    )
  })
}

export function down(queryInterface: AbstractQueryInterface) {
  return queryInterface.sequelize.transaction(async () => {
    await queryInterface.removeColumn(
      {
        schema: 'auth',
        tableName: 'users',
      },
      'firebase_uid'
    )
  })
}
