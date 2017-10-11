'use strict';

exports.up = (knex, Promise) => {
    return Promise.all([
        knex.schema.createTableIfNotExists('user_tokens', (tb) => {
            tb.increments('id').unsigned().primary();
            tb.string('token').nullable();
            tb.string('expiration').nullable();
            tb.string('reason').nullable();
            tb.integer('user_id')
                .unsigned().index()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE')
                .onUpdate('CASCADE');
            tb.timestamps(true, true);
        })
    ]);
  
};

exports.down = (knex, Promise) => {
    return Promise.all([
        knex.schema.dropTableIfExists('user_tokens')
    ]);
};
