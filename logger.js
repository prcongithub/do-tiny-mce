var env_config = require("config/environment").config;
var logger = exports;
var levels = ['info', 'debug', 'warn', 'error'];

logger.debugLevel = env_config.logLevel;

logger.log = function(level, message) {
  if (levels.indexOf(level) >= levels.indexOf(logger.debugLevel) ) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    };
    console.log(level+': '+message);
  }
};

logger.debug = function(message) {
  logger.log("debug", message);
};

logger.warn = function(message) {
  logger.log("warn", message);
};

logger.info = function(message) {
  logger.log("info",message);
};

logger.err = function(message) {
  logger.log("error",message);
};
