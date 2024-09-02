const express = require("express");
const router = express.Router(); 
const passport = require("passport");
const UserDTO = require("../dto/user.dto.js"); 
const { logger } = require('../utils/config_logger.js');


//Perfil: 
router.get("/current", (req, res) => {
    try {
        logger.info(`req.session.user: ${JSON.stringify(req.session.user, null, 2)}`)
        if (req.session.user)
        {
            const usuario = req.session.user;
            const userDto = new UserDTO(usuario); // Creamos una instancia del DTO con los datos del usuario
            res.send(userDto);

        // res.redirect("/products")
        }
        else {
            return res.send({usuario: "Debe acceder a una cuenta primero"});
        }
    } catch (error) {
        res.status(500).json({error: "Error interno del servidor"})
    }
})

module.exports = router; 

