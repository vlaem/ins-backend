import Fs from 'fs/promises'
import path from 'path'

// grab the files from src/api/routes/vi and copy them to dist/docs/v1

const copyApiDocs = async () => {
  await Fs.mkdir('dist/docs/v1', { recursive: true })

  const src = 'src/api/routes/v1/docs'
  const files = await Fs.readdir(src)

  for (const file of files) {
    const srcFile = path.join(src, file)
    const destFile = path.join(__dirname, `../dist/docs/v1/${file}`)
    await Fs.copyFile(srcFile, destFile)
  }

  process.exit(0)
}

copyApiDocs()
