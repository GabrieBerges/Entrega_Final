const CartModel = require('../dao/models/cart.model.js');
const { logger } = require('../utils/config_logger.js');
const { ObjectId } = require('mongodb');

class CartRepository {
    async createCart() {
        try {
            const carritoNuevo = new CartModel({ products: [] });
            return await carritoNuevo.save();
        } catch (error) {
            throw new Error("Error al crear el carrito");
        }
    }

    async getCartById(cid) {
        try {
            return await CartModel.findById(cid).populate("products.product");
        } catch (error) {
            throw new Error("Error al obtener el carrito indicado");
        }
    }

    async updateCart(cart) {
        try {
            return await cart.save();
        } catch (error) {
            throw new Error("Error al actualizar el carrito");
        }
    }

    async deleteProductFromCart(cid, pid) {
        try {
            logger.info("en repository");
            const carrito = await this.getCartById(cid);
            logger.info(`carrito: ${JSON.stringify(carrito, null, 2)}`)
            const existeProdIndex = carrito.products.findIndex(item => item.product._id.toString() === pid);
            logger.info(`existeProdIndex: ${JSON.stringify(existeProdIndex, null, 2)}`)

            if (existeProdIndex != -1) {
                carrito.products.splice(existeProdIndex, 1);
                carrito.markModified("products");
                return await carrito.save();
            } else {
                logger.warning("entra al else");
                throw new Error("Producto no encontrado en el carrito");
            }
        } catch (error) {
            throw new Error("Error al eliminar producto del carrito");
        }
    }

    async clearCart(cid) {
        try {
            const carrito = await this.getCartById(cid);

            carrito.products = [];
            carrito.markModified("products");

            return await carrito.save();
        } catch (error) {
            throw new Error("Error al vaciar el carrito: ", error);
        }
    }

    async replaceProductsCart(cid, body) {
        try {
            logger.info(`en cartService - cid: ${JSON.stringify(cid, null, 2)}`)
            logger.info(`en cartService - body: ${JSON.stringify(body, null, 2)}`)
            await this.clearCart(cid);
            for (const product of body) {
                await this.addProductToCart(cid, product.product, product.quantity);
            }
            return await this.getCartById(cid);
        } catch (error) {
            logger.error(`Error al reemplazar productos del carrito: ${error.message}\n${error.stack}`);
        }
    }

    async addProductToCart(cid, pid, quantity = 1) {
        try {
            logger.info("en addProductToCart de cartRepository");
            const carrito = await this.getCartById(cid);
            logger.info(`carrito: ${JSON.stringify(carrito, null, 2)}`)
            const existeProd = carrito.products.find(item => item.product._id.toString() === pid);
            logger.info(`existeProd: ${JSON.stringify(existeProd, null, 2)}`)

            if (existeProd) {
                existeProd.quantity += quantity;
            } else {
                carrito.products.push({ product: pid, quantity });
            }

            carrito.markModified("products");
            return await this.updateCart(carrito);
        } catch (error) {
            logger.error(`Error al agregar producto al carrito: ${error.message}\n${error.stack}`);
        }
    };

    async deleteCartById(cid) {
        try {    
            return await CartModel.findByIdAndDelete(cid);
        } catch (error) {
            console.log(error);
            throw new Error("Error al eliminar el carrito indicado");
        }
    }
}

module.exports = CartRepository;