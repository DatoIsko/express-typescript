const database = require('./src/app/configs/database').default;

module.exports = {
    development: database,
    production: database,
    test: database
};
