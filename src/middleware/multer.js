const multer = require('multer');
const path = require('path'); 
const fs = require('fs');
const { logger } = require('../utils/config_logger.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        logger.info(`Processing file: ${file.originalname}`);
        logger.info(`Fieldname: ${file.fieldname}`);
        let destinationFolder;
        
        switch (file.fieldname) {
            case 'profile':
                destinationFolder = path.join(__dirname, '../uploads/profiles');
                break;
            case 'products':
                destinationFolder = path.join(__dirname, '../uploads/products');
                break;
            case 'document':
                destinationFolder = path.join(__dirname, '../uploads/documents');
                break;
            default:
                destinationFolder = path.join(__dirname, '../uploads');
        }

        logger.info(`Destination folder: ${destinationFolder}`);

        // porlas si la carpeta no existe
        if (!fs.existsSync(destinationFolder)) {
            logger.error(`Directory does not exist: ${destinationFolder}`);
            fs.mkdirSync(destinationFolder, { recursive: true });
            logger.info(`Directory created: ${destinationFolder}`);
        }

        cb(null, destinationFolder);
    },
    filename: (req, file, cb) => {
        logger.info(`Saving file as: ${file.originalname}`);
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;