const TicketModel = require('../dao/models/ticket.model.js');

class TicketRepository {
    async createTicket(ticketData) {
        try {
            const newTicket = new TicketModel(ticketData);
            return await newTicket.save();
        } catch (error) {
            throw new Error("Error al crear el ticket");
        }
    }

    async getTickets() {
        try {
            return await TicketModel.find();
        } catch (error) {
            throw new Error("Error al obtener los tickets");
        }
    }

    async getTicketByCode(code) {
        try {
            return await TicketModel.findOne({ code });
        } catch (error) {
            throw new Error("Error al obtener el ticket por code");
        }
    }
}

module.exports = TicketRepository;
