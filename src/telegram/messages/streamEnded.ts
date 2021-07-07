import {ApplicationConfig} from '~/config'
import {TwitchDocument} from '~/collection'

export const createStreamEndedSender =
  (_config: ApplicationConfig, sendMessage: (message: string) => Promise<void>) =>
  (stats: TwitchDocument['stats']) =>
    sendMessage(`\
Ярик отрубил 😥
Пиковое количество зрителей на стриме - ${stats.lastStreamMaxViewers!}`)
