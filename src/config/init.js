import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 8081,
  nodeEnv: process.env.NODE_ENV || 'development',
  interfaceEndpoint: process.env.INTERFACE_ENDPOINT || 'https://kewecrawling.info',
  database: {
    dialect: process.env.DB_DIALECT || 'postgres',
    dbHost: process.env.DB_HOST || 'postgres_service',
    dbUser: process.env.DB_USER || 'postgres',
    dbPassword: process.env.DB_PASS || 'postgres',
    dbName: process.env.DB_NAME || 'kewe_crawling',
    dbPort: process.env.DB_PORT || 5432,
  },
  memCache: {
    host: process.env.REDIS_HOST || 'caching_service',
    port: process.env.REDIS_PORT || 6379,
  },
  messageQueue: {
    amqpHost: process.env.AMQP_HOST || 'rabbitmq_service',
    amqpPort: process.env.AMQP_PORT || 5672,
    amqpUser: process.env.AMQP_USER || 'admin',
    amqpPassword: process.env.AMQP_PASSWORD || 'admin',
  }
}