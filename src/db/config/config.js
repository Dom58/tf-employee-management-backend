require('dotenv').config();

module.exports = {
  "development": {
    "url": process.env.DATABASE_URL,
    "database": "employee_management",
    "username": "postgres",
    "password": "domdom",
    "dialect": "postgres",
    "operatorsAliases": false
  },
  "test": {
    "url": process.env.DATABASE_TEST_URL,
    "database": "employee_management_test",
    "username": "postgres",
    "password": process.env.DATABASE_PASSWORD_DEV,
    "dialect": "postgres",
    "operatorsAliases": false
  },
  "production": {
    "url": "127.0.0.1",
    "dialect": "postgres",
    // "operatorsAliases": false
  }
}
