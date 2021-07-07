import express from 'express'
import {wireHandlers} from './handlers'
import {ApplicationConfig} from '~/config'

export type HttpApi = {
  bootstrap: () => void
  start: () => void
}

export const createApi = (config: ApplicationConfig): HttpApi => {
  const app = express()

  const bootstrap = () => {
    wireHandlers(app)
  }

  const start = () => {
    app.listen(Number(config.port))
  }

  return {
    bootstrap,
    start,
  }
}
