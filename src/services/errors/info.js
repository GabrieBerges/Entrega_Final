const { logger } = require('../../utils/config_logger.js');

const generarInfoError = (product) => {
    logger.info(`Producto recibido para generar info de error: ${JSON.stringify(product, null, 2)}`);
    
    return `Los datos estan incompletos o no son validos. 
    Necesitamos recibir los siguientes datos:
    - title: String, pero recibimos lo siguiente: ${product.title}
    - description: String, pero recibimos ${product.description}
    - price: Number, pero recibimos ${product.price}
    - code: String, pero recibimos ${product.code}
    - stock: Number, pero recibimos ${product.stock}
    - category: String, pero recibimos ${product.category}`;
};

module.exports = generarInfoError;
