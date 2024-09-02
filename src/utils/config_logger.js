const winston = require("winston");
const configObject = require("../config/config.js");

const niveles = {
    nivel: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colores: {
        fatal: "red",
        error: "yellow",
        warning: "blue",
        info: "green",
        http: "magenta",
        debug: "white"
    }
};

const customFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
        // print log trace
        return `${timestamp} ${level}: ${message}\n${stack}`;
    }
    return `${timestamp} ${level}: ${message}`;
});

const loggerDesarrollo = winston.createLogger({
    levels: niveles.nivel,
    format: winston.format.combine(
        winston.format.colorize({ colors: niveles.colores }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
    ),
    transports: [
        new winston.transports.Console({
            level: 'debug'
        })
    ]
});

const loggerProduccion = winston.createLogger({
    levels: niveles.nivel,
    transports: [
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.colorize({ colors: niveles.colores }),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: "./src/logs/errors.log",
            level: "error",
            format: winston.format.combine(
                winston.format.simple()
            )
        })
    ]
});

const logger = configObject.node_env === "produccion" ? loggerProduccion : loggerDesarrollo;

const addLogger = (req, res, next) => {
    req.logger = logger;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleTimeString()}`);
    next();
};

module.exports = { logger, addLogger };
