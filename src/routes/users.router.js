const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const UserManager = require("../dao/controllers/UserManager.js");
const { logger } = require('../utils/config_logger.js');
const { route } = require("./views.router.js");
const upload = require("../middleware/multer.js");
const CustomError = require("../services/errors/custom-error.js");

const userManager = new UserManager();
const { UserService } = require("../services/index.js");

// Middleware para controlar acceso a rutas 
const { checkSessionUser, checkSessionAdmin } = require("../middleware/current-session.js");

// Ruta para registro
router.post('/register', (req, res, next) => {
    userManager.register(req, res, next);
});

// Ruta para login
router.post("/login", passport.authenticate("login", {
    failureRedirect: "/?error=Usuario o contraseña invalido"
}), (req, res) => {
    userManager.login(req, res);
});

// Ruta para logout
router.post('/logout', (req, res) => {
    logger.error("req.user-1")
    logger.error(req.session.user.email)
    userManager.logout(req, res);
});

// Ruta para GitHub
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => {
    logger.info("en la ruta de git");
});

// Ruta para el callback de GitHub
router.get("/githubcallback", passport.authenticate("github", {
    failureRedirect: "/login"
}), (req, res) => {
    userManager.githubCallback(req, res);
});

// Ruta para fallo en el login
router.get("/faillogin", async (req, res) => {
    res.send("Rompimos algo");
});

router.post("/requestPasswordReset", userManager.requestPasswordReset);

router.post("/reset-password", userManager.resetPassword);

router.put("/premium/:uid", userManager.changeRole); // TODO: adaptar al handlebar

router.post("/:uid/documents", upload.fields([{ name: "document" }, { name: "products" }, { name: "profile" }]), userManager.uploadDocuments);

//ENTREGA FINAL:
router.get("/", checkSessionAdmin, (req, res) => userManager.getUsers(req, res));
router.delete("/", checkSessionAdmin, (req, res) => userManager.deleteUsers(req, res));
router.delete("/deleteuser/:uid", checkSessionAdmin, (req, res) => userManager.deleteUser(req, res)); //crear método deleteUser

module.exports = router;

