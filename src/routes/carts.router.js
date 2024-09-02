
const express = require("express");
const router = express.Router();
const CartManager = require("../dao/controllers/CartManager.js");
const TicketManager = require("../dao/controllers/TicketManager.js");

const cartManager = new CartManager();
const ticketManager = new TicketManager();

// Middleware para controlar acceso a rutas 
const { checkSessionUser } = require("../middleware/current-session.js");


// Ruta para crear un nuevo carrito
router.post("/", checkSessionUser, (req, res) => cartManager.handleNewCarts(req, res));

// Ruta para obtener un carrito por ID
router.get("/:cid", checkSessionUser, (req, res) => cartManager.handleGetCartById(req, res));

// Ruta para agregar un producto a un carrito
router.post("/:cid/product/:pid", checkSessionUser, (req, res) => {
    cartManager.handleAddProductToCart(req, res)
        .then(() => {
            const redirectUrl = `${req.get('referer')}${req.get('referer').includes('?') ? '&' : '?'}added=true`;
            res.redirect(redirectUrl); // Redirige a la misma página con added=true
        })
        .catch(error => res.status(500).send("Error al agregar el producto"));
});

// Ruta para eliminar un producto de un carrito
router.delete("/:cid/products/:pid", checkSessionUser, (req, res) => cartManager.handleDeleteProductCart(req, res));

// Ruta para reemplazar los productos de un carrito
router.put("/:cid", checkSessionUser, (req, res) => cartManager.handleReplaceProductsCart(req, res));

// Ruta para actualizar un producto en un carrito
router.put("/:cid/products/:pid", checkSessionUser, (req, res) => cartManager.handleUpdateProductCart(req, res));

// Ruta para vaciar un carrito
router.delete("/:cid", checkSessionUser, (req, res) => cartManager.handleClearCart(req, res));

// Ruta para registrar la compra/ticket
router.get("/:cid/purchase", checkSessionUser, (req, res) => ticketManager.handlePurchase(req, res));


module.exports = router;
