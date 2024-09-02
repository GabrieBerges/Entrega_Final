const UserRepository = require("../repositories/user.repository.js");
const CartRepository = require("../repositories/cart.repository.js");
const ProductRepository = require("../repositories/product.repository.js");
const TicketRepository = require("../repositories/ticket.repository.js");

const UserService = new UserRepository();
const CartService = new CartRepository();
const ProductService = new ProductRepository();
const TicketService = new TicketRepository();

module.exports = { UserService, CartService, ProductService, TicketService };
