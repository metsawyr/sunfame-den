import {Pool} from 'pg'
import {collection} from '~/contants'

export type ApplicationCollection = {
  telegram: DocumentHandle<TelegramDocument>
  twitch: DocumentHandle<TwitchDocument>
}

export type DocumentHandle<T> = {
  load(): Promise<T | null>
  update(value: T): Promise<void>
}

export type TelegramDocument = {
  chats: number[]
}

export type TwitchDocument = {
  status: 'online' | 'offline'
}

export const createCollection = (db: Pool): ApplicationCollection => {
  return {
    telegram: createDocument<TelegramDocument>(db, 'telegram'),
    twitch: createDocument<TwitchDocument>(db, 'twitch'),
  }
}

function createDocument<T>(db: Pool, key: string): DocumentHandle<T> {
  const load = (): Promise<T | null> =>
    db
      .query(`select "value" from ${collection} where key='${key}'`)
      .then(({rows}) => rows[0]?.value ?? null)

  const update = async (value: T) => {
    await db.query(
      `
        insert into ${collection}(key, value)
        values ('${key}', $1::jsonb)
        on conflict (key)
        do update set value = $1::jsonb
      `,
      [value],
    )
  }

  return {
    load,
    update,
  }
}

export const createTelegramCollection = (db: Pool) => {}
