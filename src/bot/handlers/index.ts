import {Telegraf} from 'telegraf'
import {ApplicationConfig} from '~/config'
import {ApplicationCollection} from '../../collection'
import wireMemberEvents from './members'

export const wireHandlers = (
  config: ApplicationConfig,
  collection: ApplicationCollection,
  telegraf: Telegraf,
  sendMessage: (message: string) => Promise<void>,
) => {
  wireMemberEvents(config, collection, telegraf)
  telegraf.on('sticker', ctx => ctx.reply('Найс стикер'))
}
