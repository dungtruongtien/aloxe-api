"use strict";

var _express = _interopRequireDefault(require("express"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _morgan = _interopRequireDefault(require("morgan"));
var _cookieParser = _interopRequireDefault(require("cookie-parser"));
var _cors = _interopRequireDefault(require("cors"));
var _init = _interopRequireDefault(require("./config/init"));
var _db = _interopRequireDefault(require("./client/db"));
var _api = _interopRequireDefault(require("./routes/api.route"));
var _amqp = require("./client/amqp");
var _redis = require("./client/redis");
var _auth = require("./middlewares/auth.middleware");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
_dotenv.default.config();
async function bootstrap() {
  // Init db connection
  _db.default.init();
  await (0, _amqp.initMessageQueueConnection)();
  await (0, _redis.initMemcache)();
}
async function startApp() {
  const app = (0, _express.default)();
  await bootstrap(app);
  const corsOptions = {
    origin: 'http://localhost:3000'
  };
  app.use((0, _morgan.default)('dev'));
  app.use((0, _cookieParser.default)());
  app.use(_express.default.json());
  app.use(_express.default.urlencoded({
    extended: true
  }));
  app.use((0, _cors.default)(corsOptions));
  app.use('/health-check', (req, res, next) => {
    console.log('health check');
  });
  app.use('/api', _auth.authenticate, _api.default);
  app.use((err, req, res, next) => {
    //TODO: Handler logger for error level
    if (_init.default.nodeEnv === 'development') {
      console.log(err);
    }
    if (!err.status || err.status >= 500 && err.status <= 599) {
      err.status = 500;
      err.name = 'INTERNAL_ERROR';
      err.message = 'Internal error';
    }
    res.status(err.status).json({
      name: err.name,
      message: err.message
    });
  });
  app.listen(_init.default.port, () => {
    console.log(`⚡️ [server]: Server is running at https://localhost:${_init.default.port}`);
  });
}
startApp();