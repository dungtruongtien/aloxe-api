import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 8081,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    dialect: process.env.DB_DIALECT || 'mysql',
    dbHost: process.env.DB_HOST || 'localhost',
    dbUser: process.env.DB_USER || 'root',
    dbPassword: process.env.DB_PASS || 'root',
    dbName: process.env.DB_NAME || 'aloxe',
    dbPort: process.env.DB_PORT || 3306,
  }
}