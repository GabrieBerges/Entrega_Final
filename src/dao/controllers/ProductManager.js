const fs = require('fs').promises;
const { ProductService } = require("../../services/index.js");
const { logger } = require('../../utils/config_logger.js');

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async addProduct({title, description, price, img, code, stock, category, thumbnails}) {
    try {
      if (!title || !description || !price || !code || !stock || !category) {
        logger.info("No todos los campos contienen un valor");
        return;
      }

      if(await ProductService.getProductByCode(code)) {
        logger.info("El código ya existe");
        return;
      }

      const productData = {
        title,
        description,
        price,
        img, 
        code, 
        stock,
        status: true, 
        category, 
        thumbnails: thumbnails || []
      };

      return await ProductService.addProduct(productData);
    } catch (error) {
      logger.error(`Error al agregar el nuevo producto: ${error.message}\n${error.stack}`);
    }
  }

  async getProducts() { 
    try {
      return await ProductService.getProducts();
    } catch (error) {
      logger.error(`Error al recuperar los productos: ${error.message}\n${error.stack}`);
    }
  }

  async getProductById(id) {
    try {
      return await ProductService.getProductById(id);
    } catch (error) {
      logger.error(`Error al recuperar el producto indicado: ${error.message}\n${error.stack}`);
    }
  }

  async updateProduct(id, updatedProduct) {
    try {
      return await ProductService.updateProduct(id, updatedProduct);
    } catch (error) {
      logger.error(`Producto no encontrado: ${error.message}\n${error.stack}`);
    }
  }

  async deleteProduct(id) {
    try {
      return await ProductService.deleteProduct(id);
    } catch (error) {
      logger.error(`Producto no encontrado: ${error.message}\n${error.stack}`);
    }
  }

  async getPaginatedProducts(page, limit, user) {
    try {
      const products = await ProductService.getPaginatedProducts(page, limit);
      let productsResultadoFinal = products.docs.map(product => {
        const { ...rest } = product.toObject();
        return rest;
      });

      if (user.role === "premium" ) {
        productsResultadoFinal = productsResultadoFinal.filter(product => product.owner !== user.email);
      }

      return {
        products: productsResultadoFinal,
        pagination: {
          totalPages: products.totalPages,
          prevPage: products.prevPage,
          nextPage: products.nextPage,
          page: products.page,
          hasPrevPage: products.hasPrevPage,
          hasNextPage: products.hasNextPage,
          prevLink: products.prevLink,
          nextLink: products.nextLink,
          limit: limit
        },
        user: {
          email: user.email || 'mailpordefecto@algo.com',
          role: user.role || 'usuario',
          name: user.first_name + " " + user.last_name || 'UsuarioX',
          cart: user.cart
        }
      };
    } catch (error) {
      logger.error(`Error al paginar los productos: ${error.message}\n${error.stack}`);
    }
  }

  async handleGetProducts(req, res) {
    const limit = parseInt(req.query.limit);
    try {
      let products = await this.getProducts();
      if (Number.isInteger(limit) && limit > 0) {
        products = products.slice(0, limit);
      }
      const payload = products;
      res.render("home", { payload });
    } catch (error) {
      logger.error(`Error en handleGetProducts: ${error.message}\n${error.stack}`);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleGetProductById(req, res) {
    const pid = req.params.pid;
    logger.info(`product_id: ${pid}`);
    
    try {
      const product = await this.getProductById(pid);
      logger.info(`product: ${JSON.stringify(product, null, 2)}`)

      if (product) {
        res.send({ product });
      } else {
        res.send("Producto no encontrado");
      }
    } catch (error) {
      logger.error(`Error en handleGetProductById: ${error.message}\n${error.stack}`);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleAddProduct(req, res) {
    const newProduct = req.body;
    try {
      const product = await this.addProduct(newProduct);
      if (product) {
        res.status(201).json({ message: "El producto fue agregado correctamente!" });
      } else {
        res.send("Producto no creado");
      }
    } catch (error) {
      logger.error(`Error en handleAddProduct: ${error.message}\n${error.stack}`);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleUpdateProduct(req, res) {
    const pid = req.params.pid;
    const prodActualized = req.body;
    console.log(prodActualized);
    console.log(pid);
    try {
      const product = await this.updateProduct(pid, prodActualized);
      if (product) {
        res.json({ message: "El producto fue modificado correctamente!" });
      } else {
        res.send("Producto no encontrado");
      }
    } catch (error) {
      logger.error(`Error en handleUpdateProduct: ${error.message}\n${error.stack}`);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleDeleteProduct(req, res) {
    //TODO:
    // Modificar el endpoint que elimina productos, para que, en caso de que el producto pertenezca a un usuario premium, 
    // le envíe un correo indicándole que el producto fue eliminado.

    const pid = req.params.pid;
    try {
      const product = await this.deleteProduct(pid);
      if (product) {
        res.json({ message: "El producto fue eliminado correctamente!" });
      } else {
        res.send("Producto no encontrado");
      }
    } catch (error) {
      logger.error(`Error en handleDeleteProduct: ${error.message}\n${error.stack}`);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}

module.exports = ProductManager;
