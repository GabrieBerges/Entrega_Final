// se crea solo cuando el cliente le dio a comprar. 
// estructura de la consigna
// purchaser=comprador

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ticketSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // debe autogenerarse y ser único AGREGAR ESO
    purchase_datetime: { type: String, required: true }, // Deberá guardar la fecha y hora exacta en la cual se formalizó la compra (básicamente es un created_at)
    amount: { type: Number, required: true }, // total de la compra
    purchaser: { type: String }, // correo del usuario asociado al carrito
});

ticketSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

const TicketModel = mongoose.model('tickets', ticketSchema);

module.exports = TicketModel;
