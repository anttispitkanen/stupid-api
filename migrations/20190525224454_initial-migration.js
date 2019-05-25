exports.up = function(knex, Promise) {
  return knex.schema.createTable('words', table => {
    table
      .increments('id')
      .unique()
      .notNullable();
    table
      .string('word')
      .unique()
      .notNullable();
    table
      .json('synonyms')
      .notNullable()
      .defaultTo('[]');
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('words');
};
