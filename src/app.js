const express = require("express");
const exphbs = require("express-handlebars");
const { engine } = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const initializePassport = require('./config/passport.config.js');
const configObject = require("./config/config.js");
const app = express();
const PUERTO = configObject.port;
require("./database.js");
const manejadorError = require("./middleware/error.js");
const {verifProduct} = require("./utils/util.js");

const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const usersRouter = require("./routes/users.router.js")
const viewsRouter = require("./routes/views.router.js")
const sessionsRouter = require("./routes/sessions.router.js");
const { addLogger } = require("./utils/config_logger.js");

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public"));
app.use(session({
    secret: configObject.session_secret,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000}
}));

//Configuramos Express-Handlebars
const hbs = engine({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
    },
    helpers: {
        eq: (a, b) => {
            return a === b;
        }
    }
});
app.engine('handlebars', hbs);
app.set('view engine', 'handlebars');
app.set("views", "./src/views");
app.use(addLogger);
// app.engine('handlebars', engine({
//     runtimeOptions: {
//         allowProtoPropertiesByDefault: true,
//     }
// }));
// app.set('view engine', 'handlebars');
// app.set("views", "./src/views");
// app.use(addLogger);


// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/user", usersRouter)
app.use("/", viewsRouter);
app.use("/api/sessions", sessionsRouter);

//ruta para testear winston:
app.get("/loggerTest", (req, res) => {
    req.logger.http("Mensaje HTTP");
    req.logger.info("Mensaje INFO");
    req.logger.warning("Mensaje WARNING");
    req.logger.error("Mensaje ERROR");
    req.logger.fatal("Mensaje FATAL");
    res.send("Logs generados");
})

//Cambios passport:
app.use(passport.initialize());
app.use(passport.session());
initializePassport();


/////////////////////// DOCUMENTACIÓN

//1) Instalamos swagger: https://swagger.io
//npm i swagger-jsdoc swagger-ui-express

//swagger-jsdoc nos deja escribir la configuración en un archivo .yml y a partir de ahí se genera el apidoc.
//swagger-ui-express nos permite linkear una interfaz gráfica para poder visualizar la documentación.

// 2) Importamos los módulos:
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUiExpress = require('swagger-ui-express');

// 3) Crear un objeto de configuración: swaggerOptions
const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Documentacion de la App E-Commerce",
            description: "App desarrollada con el fin de facilitar las compras"
        }
    },
    apis: ["./src/docs/**/*.yaml"] //esto significa que dentro de la carpeta docs quiero que recorra todas las subcarpetas y en cada una que busque todos los archivos .yaml
}

// 4) Conectamos Swagger a nuestro servidor express:
const specs = swaggerJSDoc(swaggerOptions);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

///////////////////////--- END DOCUMENTACIÓN


const httpServer = app.listen(PUERTO, () => {
    console.log(`Escuchando en el http://localhost:${PUERTO}`)
})


//configuramos socket.io
const { Server } = require("socket.io");

const io = new Server(httpServer);

// -------- EF---------------
// io.use((socket, next) => {
//     const session = socket.request.session;
//     if (session && session.user) {
//         socket.user = session.user; // Pasar la info del usuario al socket
//         next();
//     } else {
//         next(new Error('Authentication error'));
//     }
// });
//---------------------------

//para obtener el array de productos:
// const ProductManager = require("./dao/controllers/ProductManager.js");
// const productManager = new ProductManager("./src/dao/models/products.json");
const MessageModel = require("./dao/models/messages.model.js")

const { ProductService } = require("./services/index.js")
const UserManager = require("./dao/controllers/UserManager.js");
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: "gbergescoder@gmail.com",
        pass: "ce m g w z t q b f y p l a f p"
    }
});

//Instancia de Socket.io del lado del servidor.
io.on("connection", async (socket) => {
    console.log(`User connected`);

    socket.on("loadProducts", async (userData) => {
        let products;
        console.log("En loadProducts")
        console.log(userData)
        if (userData.role === "admin") {
            products = await ProductService.getProducts();
        } else if (userData.role === "premium") {
            products = await ProductService.getProductsByOwner(userData.email);
        }
        socket.emit("products", products);
    });

    // socket.emit("products", await ProductService.getProducts());

    socket.on("eliminarProducto", async (id, role) => {
        console.log("pasa por eliminar de app.py");
        console.log("id: ", id);
        console.log("role: ", role);
        const product = await ProductService.getProductById(id)
        console.log("owner--: ", product.owner);
        await ProductService.deleteProduct(id);

        let products = []
        if (role === "admin") {
            if (product.owner != configObject.admin_user) {
                try { 
                    transport.sendMail({
                        from: "Coder Test <gbergescoder@gmail.com>",
                        to: product.owner,
                        subject: "App E-commerce Actualización",
                        html: `<h2> Hola, te informamos que tu producto ${product.title} ha sido eliminados por el administrador. </h2>
                                `
                    })
                    console.log("Correo enviado correctamente");
                } catch (error) {
                        console.log(error);
                        console.log("No se pudo che");
                }
            }
            products = await ProductService.getProducts();
        } else {
            products = await ProductService.getProductsByOwner(product.owner);
        }
        console.log("products dentro de eliminarProducto socket:", products);

        socket.emit("products", products);
    })

    socket.on("agregarProducto", async (product) => {
        console.log("pasa por app.py");
        console.log("antes del verifEmpty");
        const success = verifProduct(product);
        console.log("después del verifEmpty");
        if (success) {
            console.log("product en app.js: ", product);
            const result = await ProductService.addProduct(product);
            console.log("result--: ",result);
            let products = []
            if (result.owner === configObject.admin_user) {
                products = await ProductService.getProducts();
            } else {
                products = await ProductService.getProductsByOwner(result.owner);
            }
            socket.emit("products", products);
        }
    })


    socket.on("message", async data => {
        await MessageModel.create(data);
        const messages = await MessageModel.find();
        console.log(messages);
        io.sockets.emit("messagesLogs", messages);
    })
})

// Siempre después de las rutas
// app.use(manejadorError);
