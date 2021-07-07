import axios from 'axios'
import {EventEmitter} from 'events'
import {ApplicationCollection} from '~/collection'
import {ApplicationConfig} from '~/config'

export type TwitchFetcher = EventEmitter & {
  start: () => void
  stop: () => void
}

export const createTwitchFetcher = (
  config: ApplicationConfig,
  collection: ApplicationCollection,
): TwitchFetcher => {
  const emitter = Object.create(new EventEmitter())
  const fetchInterval = Number(config.twitchChannelFetchInterval) * 1000
  let shouldStop = false

  const start = () => {
    shouldStop = false
    ;(async () => {
      for (;;) {
        if (shouldStop) break

        await runFetchRoutine(config, collection, emitter)
        await new Promise(resolve => setTimeout(resolve, fetchInterval))
      }
    })()
  }

  const stop = () => {
    shouldStop = true
  }

  return Object.assign(emitter, {start, stop})
}

async function runFetchRoutine(
  config: ApplicationConfig,
  collection: ApplicationCollection,
  emitter: EventEmitter,
) {
  let document = await collection.twitch.load()
  if (!document) {
    document = {
      auth: null,
      status: 'offline',
      stats: {},
    }
  }

  if (!document.auth || new Date(document.auth.expiresAt).getTime() < Date.now()) {
    document.auth = await getAccessToken(config)
  }

  const stream = await fetchStream(config, document.auth.accessToken)

  if (!stream && document.status === 'online') {
    await collection.twitch.update({...document, status: 'offline'})
    emitter.emit('end', {stats: document.stats})
  } else if (stream && document.status === 'offline') {
    await collection.twitch.update({
      ...document,
      status: 'online',
      stats: {
        ...document.stats,
        lastStreamMaxViewers: 0,
      },
    })
    emitter.emit('start', stream)
  } else if (stream) {
    if (
      !document.stats.lastStreamMaxViewers ||
      stream.viewers > document.stats.lastStreamMaxViewers
    ) {
      await collection.twitch.update({
        ...document,
        stats: {
          ...document.stats,
          lastStreamMaxViewers: stream.viewers,
        },
      })
    }
  }
}

export type TwitchTokenResponse = {
  access_token: string
  expires_in: number
  token_type: 'bearer'
}

async function getAccessToken(config: ApplicationConfig) {
  const {data} = await axios.post<TwitchTokenResponse>(
    `https://id.twitch.tv/oauth2/token?client_id=${config.twitchClientId}&client_secret=${config.twitchSecret}&grant_type=client_credentials`,
  )
  const now = new Date()
  now.setSeconds(now.getSeconds() + data.expires_in)

  return {
    accessToken: data.access_token,
    expiresAt: now.toUTCString(),
  }
}

export type TwitchStreamsResponse = {
  data: {
    id: string
    user_id: string
    user_login: string
    user_name: string
    game_id: string
    game_name: string
    type: string
    title: string
    viewer_count: number
    started_at: string
    language: string
    thumbnail_url: string
    tag_ids: string[]
    is_mature: boolean
  }[]
  pagination: {
    cursor?: string
  }
}

export type TwitchStreamInfo = {
  title: string
  game: string
  viewers: number
}

async function fetchStream(
  config: ApplicationConfig,
  accessToken: string,
): Promise<TwitchStreamInfo | null> {
  const {data} = await axios.get<TwitchStreamsResponse>(
    `https://api.twitch.tv/helix/streams?user_login=${config.twitchStreamerLogin}`,
    {
      headers: {
        'Client-ID': config.twitchClientId,
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  const stream = data.data.find(
    stream => stream.user_login === config.twitchStreamerLogin,
  )

  if (!stream) {
    return null
  }

  return {
    title: stream.title,
    game: stream.game_name,
    viewers: stream.viewer_count,
  }
}
