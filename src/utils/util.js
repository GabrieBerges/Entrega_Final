const manejadorError = require("../middleware/error.js");
const CustomError = require("../services/errors/custom-error.js");
const EErrors = require("../services/errors/enum.js");
const generarInfoError = require("../services/errors/info.js");
const {faker} = require("@faker-js/faker");
const { logger } = require('./config_logger.js');

const verifProduct = (productData) => {

    logger.info(`productData: ${JSON.stringify(productData, null, 2)}`)

    try {
        if (!productData['title'] || !productData['description'] || !productData['code'] || !productData['category']) {
            throw CustomError.crearError({
                nombre: "Producto nuevo con algún valor vacío",
                causa: generarInfoError(productData),
                mensaje: "Error al intentar crear un producto",
                codigo: EErrors.VALOR_VACIO
            })
        }
        
        if (!typeof productData['price'] == "number" || !typeof productData['stock'] == "number") {
            try {
                productData['price']  = Number(productData['price']);
                productData['stock'] = Number(productData['stock']);
                
            } catch (error) {
                logger.error(`Error, no se pudo: ${error.message}\n${error.stack}`);
                throw CustomError.crearError({
                    nombre: "Producto nuevo con precio/stock incorrecto/s",
                    causa: generarInfoError(productData),
                    mensaje: "Error al intentar crear un producto",
                    codigo: EErrors.TIPO_INVALIDO
                })
            }
        }
        
        if ( productData['price'] <=0 || productData['stock'] <=0) {
            throw CustomError.crearError({
                nombre: "Producto nuevo con precio/stock incorrecto/s",
                causa: generarInfoError(productData),
                mensaje: "Error al intentar crear un producto",
                codigo: EErrors.TIPO_INVALIDO
            })
        }
        
        return true;
    } catch (error) {
        logger.error(`Error: ${error.message}\n${error.stack}`);
    }
}

const mockingProducts = () => {
    return {
        id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        code: faker.string.uuid(),
        stock: parseInt(faker.string.numeric()),
        status: faker.datatype.boolean(),
        category: faker.commerce.department(),
        thumbnail: faker.image.avatar(),
        owner: "admin"
    }
}

module.exports = { verifProduct, mockingProducts };