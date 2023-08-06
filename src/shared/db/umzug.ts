import { DataTypes, Sequelize } from '@sequelize/core'
import { Umzug, SequelizeStorage } from 'umzug'
import { Logger } from '#logger'

export function createUmzug(logger: Logger, sequelize: Sequelize) {
  const umzug = new Umzug({
    migrations: {
      glob: 'src/shared/db/migrations/*.ts',
      resolve: (params) => {
        if (!params.path) {
          throw new Error("Migration path doesn't exist")
        }

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const migration = require(params.path)
        return {
          name: params.name,
          up: async () => migration.up(params.context, sequelize.Sequelize),
          down: async () => migration.down(params.context, sequelize.Sequelize),
        }
      },
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({
      model: sequelize.define(
        'SequelizeMeta',
        {
          name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true,
            autoIncrement: false,
          },
        },
        {
          tableName: 'sequelize_meta',
          timestamps: false,
          schema: 'public',
        }
      ),
    }),
    logger: {
      debug: (payload) => logger.debug('umzug', payload),
      info: (payload) =>
        logger.info(`umzug ${payload.event} ${payload.name}`, payload),
      warn: (payload) => logger.warning('umzug', payload),
      error: (payload) => logger.error('umzug', payload),
    },
  })

  return umzug
}
