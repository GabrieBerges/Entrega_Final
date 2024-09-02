
const bcrypt = require('bcrypt');
const passport = require("passport");
const configObject = require("../../config/config.js");
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../../utils/config_logger.js');

const { TicketService } = require("../../services/index.js");
const { CartService } = require("../../services/index.js");
const { ProductService } = require("../../services/index.js");
const { listenerCount } = require('../models/product.model.js');
// const { cartManager } = require("./CartManager.js");

class TicketManager {
    async createTicket(ticketData) {
        try {
            // const { email, password } = ticketData;
            // const hashedPassword = await bcrypt.hash(password, 10);
            return await TicketService.createTicket(ticketData);
        } catch (error) {
            throw new Error('Error registrando ticket');
        }
    }

    async getTicketByCode(code) {
        try {
            return await TicketService.getTicketByCode(code);
        } catch (error) {
            logger.error(`Error obteniendo el ticket: ${error.message}\n${error.stack}`);
        }
    }

    async handlePurchase(req, res) {
        logger.info("Gestionando la compra del carrito");
        const cid = req.params.cid;
        const email = req.query.email;
        logger.info(`cid: ${cid}`);
        logger.info(`email: ${email}`);
        
        try {
            const cart = await CartService.getCartById(cid);
            const products = cart.products;
            logger.info(`products del cart: ${JSON.stringify(products, null, 2)}`)

            const purchasedProducts = [];
            const notPurchasedProducts = [];
            let purchase_total = 0;

            // Por producto hay que chequear que tenga stock
            for (const element of products) {
                const product = await ProductService.getProductById(element.product._id);
                logger.info(`product: ${JSON.stringify(product, null, 2)}`)

                // - - Si tiene stock hay que: 
                if (product.stock >= element.quantity) {
                    // - - - se suma el precio a la cantidad total de la compra
                    purchase_total += product.price * element.quantity;
                    logger.info(`purchase_total: ${purchase_total}`);
                    
                    // - - - descontarle la cantidad al stock del producto en mongo
                    product.stock -= element.quantity;
                    await ProductService.updateProduct(element.product._id, product);
                    
                    // - - - agregarlo al array de productos comprados
                    purchasedProducts.push(element);
                } else {
                    // - - Si no tiene stock se guarda en el array de no comprados 
                    notPurchasedProducts.push(element);
                }
            }

            logger.info(`email: ${email}`);

            
            let resume = {};
            
            // Se valida la posibilidad de que no se pueda comprar ningún producto del carrito
            if ( purchasedProducts.length == 0 ) {
                resume = {
                    status: "No se realizó ninguna compra",
                    email,
                    cid }
                res.render("ticket", { resume });
            }

            // - Crear el ticket en mongo
            const ticket = await TicketService.createTicket({
                code: this.getCodeTicket(),
                purchase_datetime: new Date(),
                amount: purchase_total,
                purchaser: email
            });

            // Responder con el resultado de la compra
            if (notPurchasedProducts.length > 0) {
                const cartUpdated = await CartService.replaceProductsCart(cid,notPurchasedProducts);
                logger.info(`cartUpdated: ${JSON.stringify(cartUpdated, null, 2)}`)

                const productsId = cartUpdated.products.map(item => item.product._id.toString());
                resume = {
                    status: "Compra parcial",
                    ticket,
                    productsId,
                    email,
                    cid
                }
                
            } else {
                const cartEmpty = await CartService.clearCart(cid);
                logger.info(`cartEmpty: ${JSON.stringify(cartEmpty, null, 2)}`)

                resume = {
                    status: "Compra completa",
                    ticket,
                    email,
                    cid
                }
            }
            
            res.render("ticket", { resume });

        } catch (error) {
            logger.error(`Error gestionando la compra del carrito:: ${error.message}\n${error.stack}`);
            res.status(500).json({ error: "Error gestionando la compra del carrito" });
        }

    } 

    getCodeTicket() {
        // Genera un UUID
        const ticketCode = uuidv4();
        logger.info(`ticketCode: ${ticketCode}`)
        return ticketCode;
    }

}

module.exports = TicketManager;