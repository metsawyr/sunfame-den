import {Pool} from 'pg'
import config from '~/config'
import {createTelegramBot} from '~/bot'
import {createCollection} from '~/collection'
import {ensureEnvironment} from '~/environment'

export default async () => {
  const db = new Pool({
    connectionString: config.databaseUrl,
    max: 10,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  await ensureEnvironment(db)
  const collection = createCollection(db)

  const yarosrak = createTelegramBot(config, collection)
  yarosrak.bootstrap()
  await yarosrak.start()

  process.on('SIGTERM', () => {
    yarosrak.stop()
  })
}
