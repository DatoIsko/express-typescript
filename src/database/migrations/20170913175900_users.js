'use strict';

exports.up = (knex, Promise) => {
    return Promise.all([
        knex.schema.createTableIfNotExists('users', (tb) => {
            tb.increments();
            tb.string('name', 45).notNullable();
            tb.string('email', 128).unique().notNullable();
            tb.string('password', 255).notNullable();
            tb.timestamps(true, true);
        })
    ]);
  
};

exports.down = (knex, Promise) => {
    return Promise.all([
        knex.schema.dropTableIfExists('users')
    ]);
};
