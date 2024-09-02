const dotenv = require("dotenv"); 
const program = require("../utils/commander.js"); 

const { mode } = program.opts(); 

dotenv.config({
    // path: mode === "produccion" ? "./.env.produccion" : "./.env.desarrollo" //ejemplo de como sería con varios entornos 
    path: "./.env"
})

const configObject = {
    mongo_url: process.env.MONGO_URL,
    session_secret: process.env.SESSION_SECRET,
    port: process.env.PORT || 8080,
    admin_user: process.env.ADMIN_USER,
    admin_password: process.env.ADMIN_PASSWORD, 
    git_client_id: process.env.GIT_CLIENT_ID, 
    git_client_secret: process.env.GIT_CLIENT_SECRET,
    git_callback_url: process.env.GIT_CALLBACK_URL,
    git_password: process.env.GIT_PASSWORD,
    node_env: process.env.NODE_ENV
}

module.exports = configObject;