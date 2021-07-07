export type ApplicationConfig = {
  port: string
  databaseUrl: string
  telegramApiKey: string
  telegramBotUsername: string
  twitchChannelFetchInterval: string
  twitchClientId: string
  twitchSecret: string
  twitchStreamerLogin: string
}

export default (() => {
  const configCache: Partial<ApplicationConfig> = {}
  const keys: Array<keyof ApplicationConfig> = [
    'port',
    'databaseUrl',
    'telegramApiKey',
    'telegramBotUsername',
    'twitchChannelFetchInterval',
    'twitchClientId',
    'twitchSecret',
    'twitchStreamerLogin',
  ]

  return keys.reduce((accumulator, configKey) => {
    return Object.defineProperty(accumulator, configKey, {
      configurable: false,
      get() {
        return (
          configCache[configKey] ??
          (configCache[configKey] =
            process.env[
              configKey.replace(/[A-Z]/g, symbol => `_${symbol}`).toUpperCase()
            ])
        )
      },
    })
  }, {} as ApplicationConfig)
})()
