const UserModel = require('../dao/models/user.model.js');
const { logger } = require('../utils/config_logger.js');

class UserRepository {
    async createUser(datosUser) {
        try {
            return await UserModel.create({ email, password: hashedPassword });
        } catch (error) {
            throw new Error("Error al crear el usuario");
        }
    }

    async getUsers() {
        try {
            return await UserModel.find();
        } catch (error) {
            throw new Error("Error al obtener los usuarios");
        }
    }

    async getUserByEmail(email) {
        try {
            const user = await UserModel.findOne({ email });
            return user;
        } catch (error) {
            throw new Error("Error al obtener el usuario por email");
        }
    }

    async getUserById(uid) {
        try {
            const user = await UserModel.findById(uid);
            console.log(user)
            return user
        } catch (error) {
            logger.error(`Error autenticando alcambiando el rol del usuario: ${error.message}\n${error.stack}`);
        }
    }
    async updateUser(uid, query) {
        try {
            return await UserModel.findByIdAndUpdate(uid, query);
        } catch (error) {
            logger.error(`Error autenticando alcambiando el rol del usuario: ${error.message}\n${error.stack}`);
        }
    }

    async deleteUserByEmail(email) {
        try {
            return await UserModel.deleteOne({ email: email });;
        } catch (error) {
            throw new Error("Error al obtener el usuario por email");
        }
    }
}

module.exports = UserRepository;
