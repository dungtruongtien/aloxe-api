"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _fs = _interopRequireDefault(require("fs"));
var _init = _interopRequireDefault(require("../config/init"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const modelFiles = _fs.default.readdirSync(__dirname + "/../models/").filter(file => file.endsWith(".js"));
const sequelizeService = {
  init: async () => {
    try {
      let connection = new _sequelize.Sequelize({
        dialect: _init.default.database.dialect,
        port: _init.default.database.dbPort,
        host: _init.default.database.dbHost,
        username: _init.default.database.dbUser,
        password: _init.default.database.dbPassword,
        database: _init.default.database.dbName,
        define: {
          timestamps: true
        }
      });

      // Testing connection
      await connection.authenticate();

      // Loading models automatically
      for (const file of modelFiles) {
        const model = await (specifier => new Promise(r => r(specifier)).then(s => _interopRequireWildcard(require(s))))(`../models/${file}`);
        model.default.init(connection);
      }
      modelFiles.map(async file => {
        const model = await (specifier => new Promise(r => r(specifier)).then(s => _interopRequireWildcard(require(s))))(`../models/${file}`);
        model.default.associate && model.default.associate(connection.models);
      });

      // Only force sync in develop
      if (process.env.NODE_ENV === 'development') {
        // await connection.sync({ force: true });
      }
      console.log("[SEQUELIZE] Database service initialized");
    } catch (error) {
      console.log("[SEQUELIZE] Error during database service initialization");
      throw error;
    }
  }
};
var _default = exports.default = sequelizeService;