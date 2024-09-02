const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number },
    password: { type: String, required: true },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "carts",
        required: true
    },
    role: { type: String,
        enum: ["admin", "usuario", "premium"],
        default: 'usuario' },
    resetToken: {
        token: String,
        expire: Date
    }, 
    documents: [{
        name: { type: String }, // nombre del documento
        reference: { type: String } // link al documento 
    }], 
    last_connection: {
        type: Date, 
        default: Date.now
    } // fecha/date login y logout
});

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model('users', userSchema);

module.exports = UserModel;
