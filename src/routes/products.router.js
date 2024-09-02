
const express = require("express");
const router = express.Router();
const ProductManager = require("../dao/controllers/ProductManager.js");

const productManager = new ProductManager("./src/dao/models/products.json");

// Middleware para controlar acceso a rutas 
const { checkSessionUser, checkSessionAdmin } = require("../middleware/current-session.js");

// Ruta para obtener productos
router.get("/", checkSessionUser, (req, res) => productManager.handleGetProducts(req, res));

// Ruta para obtener un producto por ID
router.get("/:pid", checkSessionUser, (req, res) => productManager.handleGetProductById(req, res));

// Ruta para agregar / crear un producto
router.post("/", checkSessionAdmin, (req, res) => productManager.handleAddProduct(req, res));

// Ruta para actualizar un producto
router.put("/:pid", checkSessionAdmin, (req, res) => productManager.handleUpdateProduct(req, res));

// Ruta para eliminar un producto
router.delete("/:pid", checkSessionAdmin, (req, res) => productManager.handleDeleteProduct(req, res));

module.exports = router;