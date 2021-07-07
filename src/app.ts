import {Pool} from 'pg'
import config from '~/config'
import {createApi} from '~/http'
import {createTelegramBot} from '~/telegram'
import {createCollection} from '~/collection'
import {ensureEnvironment} from '~/environment'
import {createTwitchFetcher} from './twitch'

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

  const telegramBot = createTelegramBot(config, collection)
  telegramBot.bootstrap()
  await telegramBot.start()

  const twitchFetcher = createTwitchFetcher(config, collection)
  twitchFetcher.on('start', stream => {
    telegramBot.notifyStreamStarted(stream)
  })
  twitchFetcher.on('end', stats => {
    telegramBot.notifyStreamEnded(stats)
  })
  twitchFetcher.start()

  const api = createApi(config)
  api.bootstrap()
  api.start()

  process.on('SIGTERM', () => {
    telegramBot.stop()
    twitchFetcher.stop()
  })
}
