export type ApplicationConfig = {
  telegramApiKey: string
  telegramBotUsername: string
  databaseUrl: string
}

export default (() => {
  const configCache: Partial<ApplicationConfig> = {}
  const keys: Array<keyof ApplicationConfig> = [
    'telegramApiKey',
    'telegramBotUsername',
    'databaseUrl',
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
