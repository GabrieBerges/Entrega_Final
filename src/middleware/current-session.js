const { logger } = require('../utils/config_logger.js');

const checkSessionAdmin = (req, res, next) => {
    logger.info("en checkSessionAdmin");
    logger.info(`req.session.user: ${JSON.stringify(req.session.user, null, 2)}`)
    if (req.session.user) {
        if (req.session.user.role === "usuario") {
            return res.redirect('/products');
        }
        console.log("no es user");
        next();
    } else {
        return res.redirect('/');
    }
};

const checkSessionUser = (req, res, next) => {
    logger.info("en checkSessionUser");
    logger.info(`req.session.user: ${JSON.stringify(req.session.user, null, 2)}`)
    if (req.session.user) {
        if (req.session.user.role === "admin") {
            return res.redirect('/realtimeproducts');
        }
        next();
    } else {
        return res.redirect('/');
    }
};


module.exports = { checkSessionAdmin, checkSessionUser };