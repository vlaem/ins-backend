import { Hono } from 'hono'
import mustache from 'mustache'
import fs from 'fs'
import path from 'path'
import { minify } from 'html-minifier'

const relativePath = path.relative(process.cwd(), __dirname)
const indexTemplate = fs.readFileSync(
  path.join(relativePath, 'index.mustache'),
  'utf8'
)
mustache.parse(indexTemplate)

interface Options {
  urls: { url: string; name: string }[]
}

const setupSwagger = (app: Hono, options: Options) => {
  const apiDocsHtml = mustache.render(indexTemplate, {
    urls: JSON.stringify(options.urls),
    version: '5.2.0',
  })

  const minifiedApiDocsHtml = minify(apiDocsHtml, {
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: true,
  })

  app.get('/api-docs', (c) => {
    c.header('Content-Type', 'text/html')
    return c.html(minifiedApiDocsHtml, 200)
  })

  return app
}

export default setupSwagger
