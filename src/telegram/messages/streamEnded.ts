import {ApplicationConfig} from '~/config'
import {TwitchDocument} from '~/collection'

export const createStreamEndedSender =
  (_config: ApplicationConfig, sendMessage: (message: string) => Promise<void>) =>
  (stats: TwitchDocument['stats']) =>
    sendMessage(`\
Ярик отрубил 😥
На стриме было максимум ${stats.lastStreamMaxViewers!} покупателей wraith band'ов`)
