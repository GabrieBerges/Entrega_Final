const ProductModel = require('../dao/models/product.model.js');
const CustomError = require("../services/errors/custom-error.js");
const EErrors = require("../services/errors/enum.js");
const generarInfoError = require("../services/errors/info.js");
const { logger } = require('../utils/config_logger.js');
//para traer los valores del .env
const configObject = require("../config/config.js");

class ProductRepository {
    async addProduct(productData) {
        try {
            logger.info(`productData: ${JSON.stringify(productData, null, 2)}`)
            logger.info(`productData.code: ${JSON.stringify(productData.code, null, 2)}`)
            
            //primero nos aseguramos de que no exista el código
            const result = await this.getProductByCode(productData.code);

            logger.info(`result: ${JSON.stringify(result, null, 2)}`)

            if (result) {
                throw CustomError.crearError({
                    nombre: "Producto nuevo con algún valor vacío o erróneo",
                    causa: generarInfoError(productData),
                    mensaje: "Ya existe el código : " + productData.code,
                    codigo: EErrors.BD_ERROR
                })
            }

            const nuevoProducto = new ProductModel(productData);
            return await nuevoProducto.save();
        } catch (error) {
            logger.error("Ha ocurrido un error creando el nuevo producto");
            return error;
        }
    }

    async getProducts() {
        try {
            console.log("-En getProducts-admin")
            const products = await ProductModel.find().lean();
            
            return products
        } catch (error) {   
            throw new Error("Error al recuperar los productos");
        }
    }

    async getProductById(id) {
        try {
            logger.info(`dentro de productById. id recibido: ${id}`);
            const product = await ProductModel.findById(id).lean();
            console.log("product en getProductById:", product);
            
            return product
        } catch (error) {
            throw new Error("Error al recuperar el producto indicado");
        }
    }

    async getProductByCode(code) {
        try {
            logger.info(`code: ${code}`);
            return await ProductModel.findOne({ code: code });
        } catch (error) {
            logger.error(`Error al recuperar el producto indicado: ${error.message}\n${error.stack}`);
            throw new Error("Error al recuperar el producto indicado");
        }
    }

    async getProductsByOwner(owner) {
        console.log("Owner en by ownwer: ", owner);
        
        const products = await ProductModel.find({ owner });
        console.log("products by owner: ", products);
        
        return products;
    }

    async updateProduct(id, updatedProduct) {
        try {
            return await ProductModel.findByIdAndUpdate(id, updatedProduct);
        } catch (error) {
            console.log(error);
            throw new Error("Error al actualizar el producto");
        }
    }

    async deleteProduct(id) {
        try {
            return await ProductModel.findByIdAndDelete(id);
        } catch (error) {
            throw new Error("Error al eliminar el producto");
        }
    }

    async getPaginatedProducts(page, limit) {
        try {
            return await ProductModel.paginate({}, { page, limit });
        } catch (error) {
            throw new Error("Error al paginar los productos");
        }
    }
}

module.exports = ProductRepository;