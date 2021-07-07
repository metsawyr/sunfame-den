import {Telegraf} from 'telegraf'
import {ApplicationConfig} from '~/config'
import {ApplicationCollection} from '~/collection'
import {wireHandlers} from './handlers'

export type TelegramBot = {
  bootstrap: () => void
  start: () => Promise<void>
  stop: () => Promise<void>
  sendMessage: (message: string) => Promise<void>
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
  }
}
