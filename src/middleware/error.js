const { EErrors } = require("../services/errors/enum.js");
const { logger } = require('../utils/config_logger.js');

const manejadorError = (error, req, res, next) => {

    console.log(error.causa);
    logger.info(`error.causa: ${JSON.stringify(error.causa, null, 2)}`)

    switch(error.code) {

        case EErrors.TIPO_INVALIDO: 
            res.send({status: "error", error: error.nombre})
            break; 
        
        case EErrors.VALOR_VACIO:
            res.send({status: "error", error: error.nombre})
            break; 

        default: 
            res.send({status: "error", error: "Error desconocido, vamo a mori"});

    }

}

module.exports = manejadorError;