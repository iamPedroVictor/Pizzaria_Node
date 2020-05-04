const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT,
  host: process.env.databaseHost,
  user: process.env.databaseUser,
  password: process.env.databasePassword,
  database: process.env.databaseName
};