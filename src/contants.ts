import config from '~/config'

export const schema = `"${config.databaseSchema}"`
export const collection = `${schema}."collection"`
