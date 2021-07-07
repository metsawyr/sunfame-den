import {ApplicationConfig} from '~/config'
import {TwitchStreamInfo} from '~/twitch/fetcher'

export const createStreamStartedSender =
  (config: ApplicationConfig, sendMessage: (message: string) => Promise<void>) =>
  (stream: TwitchStreamInfo) =>
    sendMessage(`\
Ярик подрубил ${stream.game}!\n\
${stream.title}\n\
https://www.twitch.tv/${config.twitchStreamerLogin}\
`)
