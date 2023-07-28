import { serve } from '@hono/node-server'
import app from 'src/api/app'

serve(app, (info) => {
  // eslint-disable-next-line no-console
  console.log(`Listening on http://localhost:${info.port}`)
})
