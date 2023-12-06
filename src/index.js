import express from 'express';
import dotenv from 'dotenv';
import logger from 'morgan';
import { createServer } from 'node:http';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import config from './config/init';
import sequelizeService from './client/db';
import apiRouteHandler from './routes/api.route';
import { initSocketConnection } from './client/socket';

dotenv.config();

async function bootstrap() {
  // Init db connection
  await sequelizeService.init();
}

async function startApp() {
  const app = express();
  await bootstrap();

  const corsOptions = {
    origin: config.interfaceEndpoint,
  };

  app.use(logger('dev'));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));


  app.use(cors());

  app.use('/health-check', (req, res, next) => { console.log('health check') });
  app.use('/api', apiRouteHandler);

  app.use((err, req, res, next) => {
    //TODO: Handler logger for error level
    if (config.nodeEnv === 'development') {
      console.log(err)
    }

    if (!err.status || err.status >= 500 && err.status <= 599) {
      err.status = 500;
      err.name = 'INTERNAL_ERROR';
      err.message = 'Internal error';
    }
    res.status(err.status).json({
      name: err.name,
      message: err.message,
      data: null,
      status: err.name,
    })
  })

  const server = createServer(app);
  initSocketConnection(server);


  server.listen(config.port, () => {
    console.log(`⚡️ [server]: Server is running at https://localhost:${config.port}`);
  });

}

startApp();