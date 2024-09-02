
const fs = require("fs").promises;
const CartModel = require("../models/cart.model.js");
const { CartService } = require("../../services/index.js");
const { logger } = require('../../utils/config_logger.js');
const { ObjectId } = require('mongodb');

class CartManager {
  constructor() {
    this.carts = [];
    this.lastId = 0;
  }

  async newCarts() {
    try {
      return CartService.createCart();
    } catch (error) {
      logger.error(`Error al crear el carrito: ${error.message}\n${error.stack}`);
    }
  }

  async getCartById(cid) {
    try {
      return await CartService.getCartById(cid);
    } catch (error) {
      logger.error(`Error al obtener el carrito indicado: ${error.message}\n${error.stack}`);
    }
  }

  async deleteProductCart(cid, pid) {
    return await CartService.deleteProductFromCart(cid,pid);
  }

  async updateProductCart(cid, pid, quantity = 1) {
    try {
      const carrito = await CartService.getCartById(cid);

      const existeProd = carrito.products.find(item => item.product._id.toString() === pid);

      if (existeProd) {
        existeProd.quantity = quantity;
      } else {
        logger.info("No se encontró un producto con ese Id en el carrito");
        return;
      }

      carrito.markModified("products");
      return await CartService.updateCart(carrito);
    } catch (error) {
      logger.error(`Error al actualizar producto del carrito: ${error.message}\n${error.stack}`);
    }
  }

  // Métodos para manejar lo que saqué del router
  async handleNewCarts(req, res) {
    try {
      const newCart = await this.newCarts();
      res.status(201).json(newCart);
    } catch (error) {
      logger.error(`Error en handleNewCarts: ${error.message}\n${error.stack}`);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleGetCartById(req, res) {
    const cId = req.params.cid;
    const email = req.query.email
    try {
      let cart = await CartService.getCartById(cId);
      const products = cart.products.map(item => ({
        product: item.product.toObject(),
        quantity: item.quantity
      }));

      logger.info(`products antes de cart.handl: ${JSON.stringify(products, null, 2)}`)
      logger.info(`email: ${email}`);

      res.render("cart", { cId, email, products });
    } catch (error) {
      logger.error(`Error en handleGetCartById: ${error.message}\n${error.stack}`);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleAddProductToCart(req, res) {
    console.log("EN ADD PRODUCT TO CART");
    
    const cid = req.params.cid;
    const pid = req.params.pid;
    console.log("cid: ", cid);
    console.log("pid: ", pid);
    
    const quantity = parseInt(req.body.quantity) || 1;
    try {
      const cartActualized = await CartService.addProductToCart(cid, pid, quantity);
      logger.info(`Producto agregado: ${JSON.stringify(cartActualized.products, null, 2)}`)
      // logger.info(`Producto agregado: ${cartActualized.products}`)

    } catch (error) {
      logger.error(`Error en handleAddProductToCart: ${error.message}\n${error.stack}`);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleDeleteProductCart(req, res) {
    const cid = req.params.cid;
    const pid = req.params.pid;
    try {
      const cartActualized = await this.deleteProductCart(cid, pid);
      res.status(201).json(cartActualized.products);
    } catch (error) {
      logger.error(`Error en handleDeleteProductCart: ${error.message}\n${error.stack}`);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleReplaceProductsCart(req, res) {
    const cid = req.params.cid;
    const body = req.body;
    try {
      const cartActualized = await CartService.replaceProductsCart(cid, body);
      res.status(201).json(cartActualized.products);
    } catch (error) {
      logger.error(`Error en handleReplaceProductsCart: ${error.message}\n${error.stack}`);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleUpdateProductCart(req, res) {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity;
    try {
      const cartActualized = await this.updateProductCart(cid, pid, quantity);
      res.status(201).json(cartActualized.products);
    } catch (error) {
      logger.error(`Error en handleUpdateProductCart: ${error.message}\n${error.stack}`);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleClearCart(req, res) {
    const cid = req.params.cid;
    try {
      const cartActualized = await CartService.clearCart(cid);
      res.status(201).json(cartActualized.products);
    } catch (error) {
      logger.error(`Error en handleClearCart: ${error.message}\n${error.stack}`);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleDeleteCart(cid) {
    try {
      console.log("en handledeletecart");
      
      const cartDeleted = await CartService.deleteCartById(ObjectId(cid));
      console.log(cartDeleted);
      
      return cartDeleted;
    } catch (error) {
      logger.error(`Error en handleDeleteCart: ${error.message}\n${error.stack}`);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

}

module.exports = CartManager;