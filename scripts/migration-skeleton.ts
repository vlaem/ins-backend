import fs from 'fs'
import path from 'path'
import { DateTime } from 'luxon'

const migrationsPath = 'src/shared/db/migrations'

const migrationFileContents = `import { DataTypes, AbstractQueryInterface } from '@sequelize/core'

export function up(queryInterface: AbstractQueryInterface) {

}

export function down(queryInterface: AbstractQueryInterface) {  

}
`

const generateFile = (name: string = 'migration') => {
  const now = DateTime.now()

  const fileName = `${now.toFormat('yyyyMMddHHmmss')}-${name}.ts`

  const filePath = path.join(migrationsPath, fileName)

  fs.writeFileSync(filePath, migrationFileContents)

  process.exit(0)
}

generateFile(process.argv[2])
