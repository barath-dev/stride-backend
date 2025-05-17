const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  "development": {
    "username": "postgres",
    "password": "0000",
    "database": "database_development",
    "host": "127.0.0.1",
    "port": 5432,
    "dialect": "postgres"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "port": 5432,
    "dialect": "postgres"
  },
  "production": {
    "username": "postgres",
    "password": process.env.DB_PASSWORD_PROD,
    "database": "postgres",
    "host": "stride-prod-database.cofeus8mq2xp.us-east-1.rds.amazonaws.com",
    "port": 5432,
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        // "require": true,
        "rejectUnauthorized": false  // Use this for testing only
      }
    }
  }
}
