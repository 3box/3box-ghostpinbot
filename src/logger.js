const winston = require('winston');

const { format } = winston;
const {
  printf, timestamp, combine, colorize,
} = format;

const customFormat = printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`);

const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';

/**
 * Creates singleton logger
 */
class Logger {
  constructor() {
    this._logger = Logger._create();
  }

  /**
   * Create logger
   * @return {Logger}
   * @private
   */
  static _create() {
    return winston.createLogger({
      level: LOG_LEVEL,
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.ms' }),
        customFormat,
      ),
      transports: [
        new winston.transports.Console({
          format: combine(
            colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss.ms' }),
            customFormat,
          ),
        }),
      ],
    });
  }
}

const LOGGER_INSTANCE = new Logger();

// ensure the API is never changed
Object.freeze(LOGGER_INSTANCE);

/**
 * Creates simple proxy to logger underneath
 * @returns {Logger}
 */
const proxy = () => new Proxy(LOGGER_INSTANCE, {
  get(target, propKey) {
    return target._logger[propKey];
  },
});

const LOGGER_PROXY_INSTANCE = proxy();

// create a unique, global symbol name
// -----------------------------------
const LOGGER_KEY = Symbol.for('ghost.logger');

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

const globalSymbols = Object.getOwnPropertySymbols(global);
const hasLogger = (globalSymbols.indexOf(LOGGER_KEY) > -1);

if (!hasLogger) {
  global[LOGGER_KEY] = LOGGER_PROXY_INSTANCE;
}

module.exports = global[LOGGER_KEY];
