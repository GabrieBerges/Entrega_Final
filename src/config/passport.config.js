//Instalamos: npm i passport passport-local

//1)Importamos los módulos: 
const passport = require("passport");
const local = require("passport-local"); //etsrategia elegida

// //Estrategia con GitHub:
const GitHubStrategy = require("passport-github2");

//1)Traemos el UsuarioModel y las funciones de bcryp: 
const UsuarioModel = require("../dao/models/user.model.js");
const { createHash, isValidPassword } = require("../utils/hashbcrypt.js");

//necesitamos esto para crear el nuevo carrito al registrarse
const CartManager = require("../dao/controllers/CartManager.js");
const cartManager = new CartManager("./src/dao/models/carts.json");

//para traer los valores del .env
const configObject = require("./config.js");

const { logger } = require('../utils/config_logger.js');

//1)
const LocalStrategy = local.Strategy;

const initializePassport = () => {
//Vamos a armar nuestras estrategias: Registro y Login. 

    passport.use("register", new LocalStrategy({
        //Le digo que quiero acceder al objeto request
        passReqToCallback: true,
        usernameField: "email"
    }, async (req, email, password, done) => {
        
        logger.info("EN EL REGISTER PASSPORT");
        const { first_name, last_name, age } = req.body;
        try {
            //verificar que no estpen vacío los campos
            if (!first_name || !last_name || !age || !email || !password) {
                return done(null, false, { message: "Complete todos los campos, por favor" });
            }
            //Verificamos si ya existe un registro con ese mail: 
            let user = await UsuarioModel.findOne({ email });
            
            if (user) {
                logger.info("dentro del if - el mail ya existe");
                return done(null, false, { message: "El usuario ya existe" });
            }
            
            let role = "usuario"
            // defino el rol admin para el usuario admin
            if (email === configObject.admin_user && password === configObject.admin_password) {
                logger.info("defino el rol admin para el usuario correspondiente");
                role = 'admin';
            }
            const newCart = await cartManager.newCarts();
            const cart = newCart._id;
            
            //Si no existe voy a crear un registro de usuario nuevo: 
            let newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                cart,
                role
            }
            
            let result = await UsuarioModel.create(newUser);

            return done(null, result);
            //Si todo resulta bien, podemos mandar done con el usuario generado. 
        } catch (error) {
            logger.error(`Error durante el registro: ${error.message}\n${error.stack}`);
            return done(error);
        }
    }))

    //Agregamos otra estrategia para el "Login".
    passport.use("login", new LocalStrategy({
        usernameField: "email"
    }, async (email, password, done) => {

        logger.info(`email: ${email}`);
        logger.info(`password: ${password}`)
        try {
            //Verifico si existe un usuario con ese email: 
            let user = await UsuarioModel.findOne({ email });
            logger.info(`user: ${JSON.stringify(user, null, 2)}`)
            if (!user) {
                logger.info("Este usuario no existe");
                return done(null, false, { message: "Usuario no encontrado" });
            }

            //Si existe verifico la contraseña: 
            if (!isValidPassword(password, user)) {
                return done(null, false, { message: "Contraseña incorrecta" });
            }
            logger.info("antes del done");
            return done(null, user);


        } catch (error) {
            logger.error(`Error durante el login: ${error.message}\n${error.stack}`);
            return done(error);
        }
    }))
    
    //2) primero se configura la aplicación en git y se instala npm i passport-github2
    // Acá generamos la nueva estrategia con GitHub: 

    passport.use("github", new GitHubStrategy({
        clientID: configObject.git_client_id,
        clientSecret: configObject.git_client_secret,
        callbackURL: configObject.git_callback_url
    }, async (accessToken, refreshToken, profile, done) => {
        
        //Veo los datos del perfil
        logger.info(`Profile: ${JSON.stringify(profile, null, 2)}`)

        const newCart = await cartManager.newCarts();
        const cart = newCart._id;

        try {
            let user = await UsuarioModel.findOne({ email: profile._json.email });
            logger.info(`user: ${JSON.stringify(user, null, 2)}`)
            user = null
            if (!user) {
                logger.info("hay que crear uno nuevo");
                logger.info(`login: ${profile._json.login}`);
                let newUser = {
                    first_name: profile.displayName,
                    last_name: profile.username,
                    email: profile._json.email,
                    age: 0,
                    password: configObject.git_password, //si dejaba la contraseña vacía, comprometía la consistencia de la bd, por eso preferí no quitar el requerido en el modelo
                    cart,
                    role: "usuario"
                }
                logger.info(`newUser: ${JSON.stringify(newUser, null, 2)}`)

                let result = await UsuarioModel.create(newUser);

                done(null, result);
            } else {
                done(null, user);
            }
        } catch (error) {
            logger.error(`Error durante el passport de github: ${error.message}\n${error.stack}`);
            return done(error);
        }
    }))

    //Serializar y deserializar: 

    passport.serializeUser((user, done) => {
        logger.info(`Serializing user: ${JSON.stringify(user, null, 2)}`)
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await UsuarioModel.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });

}

module.exports = initializePassport;
