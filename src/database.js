const mongoose = require("mongoose");
const configObject = require("./config/config.js");
const { logger } = require('./utils/config_logger.js');

mongoose.connect(configObject.mongo_url)
    .then(() => logger.info("Conexión exitosa!"))
    .catch((error) => logger.error(`Hubo un error en la conexión: ${error.message}\n${error.stack}`));