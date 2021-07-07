import {Application} from 'express'
import {json as jsonParser} from 'body-parser'

export const wireHandlers = (app: Application) => {
  app.use(jsonParser())
}
