import { Sequelize } from "sequelize";
import fs from "fs";

import config from "../config/init";

const modelFiles = fs
  .readdirSync(__dirname + "/../models/")
  .filter((file) => file.endsWith(".js"));

const sequelizeService = {
  init: async () => {
    try {
      let connection = new Sequelize({
        dialect: config.database.dialect,
        port: config.database.dbPort,
        host: config.database.dbHost,
        username: config.database.dbUser,
        password: config.database.dbPassword,
        database: config.database.dbName,
        logging: true,
        define: {
          timestamps: true
        },
      });

      // Testing connection
      await connection.authenticate();

      // Loading models automatically
      for (const file of modelFiles) {
        const model = await import(`../models/${file}`);
        model.default.init(connection);
      }

      modelFiles.map(async (file) => {
        const model = await import(`../models/${file}`);
        model.default.associate && model.default.associate(connection.models);
      });

      console.log("[SEQUELIZE] Database service initialized");
    } catch (error) {
      console.log("[SEQUELIZE] Error during database service initialization");
      throw error;
    }
  },
};

export default sequelizeService;