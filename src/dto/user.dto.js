
class UserDTO {
    constructor({ first_name, last_name, email, role, cart }) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.role = role;
        this.cart = cart;
    }
}

module.exports = UserDTO;