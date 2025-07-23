// config/db.js
const { Sequelize } = require('sequelize');
const config = require('./config');

// Get the environment-specific configuration
const env = process.env.NODE_ENV || 'production';
const dbConfig = config[env];

// Create Sequelize instance with connection pooling
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    logging: env === 'development' ? console.log : false,
    pool: {
      max: 20, // Maximum number of connection in pool
      min: 5, // Minimum number of connection in pool
      acquire: 30000, // Maximum time, in milliseconds, that pool will try to get connection before throwing error
      idle: 10000, // Maximum time, in milliseconds, that a connection can be idle before being released
    },
    retry: {
      max: 3, // Maximum amount of connection retries
    },
  }
);

// Test the connection
(async () => {
  try {
    if (env === 'development') {
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = sequelize;
