import {Telegraf} from 'telegraf'
import {ApplicationConfig} from '~/config'
import {ApplicationCollection, TwitchDocument} from '~/collection'
import {wireHandlers} from './handlers'
import {TwitchStreamInfo} from '~/twitch/fetcher'
import {createStreamStartedSender} from './messages/streamStarted'
import {createStreamEndedSender} from './messages/streamEnded'

export type TelegramBot = {
  bootstrap: () => void
  start: () => Promise<void>
  stop: () => Promise<void>
  sendMessage: (message: string) => Promise<void>
  notifyStreamStarted: (stream: TwitchStreamInfo) => Promise<void>
  notifyStreamEnded: (stats: TwitchDocument['stats']) => Promise<void>
}

export const createTelegramBot = (
  config: ApplicationConfig,
  collection: ApplicationCollection,
): TelegramBot => {
  const telegraf = new Telegraf(config.telegramApiKey)

  const sendMessage = async (message: string) => {
    const document = await collection.telegram.load()
    if (!document) {
      console.error('TELEGRAM_DOCUMENT_IS_MISSING')
      return
    }

    await Promise.all(
      document.chats.map(chatId => telegraf.telegram.sendMessage(chatId, message)),
    )
  }

  const bootstrap = () => {
    wireHandlers(config, collection, telegraf, sendMessage)
  }

  const start = async () => {
    await telegraf.launch()
  }

  const stop = async () => {
    await telegraf.stop()
  }

  return {
    bootstrap,
    start,
    stop,
    sendMessage,
    notifyStreamStarted: createStreamStartedSender(config, sendMessage),
    notifyStreamEnded: createStreamEndedSender(config, sendMessage),
  }
}
