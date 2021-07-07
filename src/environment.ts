import {Pool} from 'pg'
import {schema, collection} from '~/contants'

export const ensureEnvironment = async (db: Pool) => {
  db.query(`
    create schema if not exists ${schema};

    create table if not exists ${collection}(
      "key" varchar(256) primary key,
      "value" jsonb
    );
  `)
}
