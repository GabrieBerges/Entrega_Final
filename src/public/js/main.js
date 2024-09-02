//ESTE ES EL LADO CLIENTE
console.log("en main.js funciona pls");

// Captura los valores de email y role desde los inputs ocultos en la página
const userRole = document.getElementById("role").value;
const userEmail = document.getElementById("email").value;

const socket = io();
// const { logger } = require('../../utils/config_logger.js');

// // el evento "mensaje" se debe respetar en el socket.on en app.js (el lado del servidor)
// socket.emit("mensaje", "Hola mundo, te escribo desde el cliente");

// Enviamos datos del usuario al servidor
// const userData = {
//     email: document.getElementById("email").value,
//     role: document.getElementById("role").value
// };

// Enviar los datos del usuario al servidor
const userData = {
    email: userEmail,
    role: userRole
};

socket.emit("loadProducts", userData);

// // recibimos el producto
socket.on("connect", () => {
    console.log("Conectado al servidor de socket.io");
    query: { token: localStorage.getItem('token') }
});
socket.on("products", (data) => {
    console.log("Productos recibidos: ", data);
    renderProductos(data);
})


//función para renderizar la lista de prods
const renderProductos = (products) => {
    const contenedorProductos = document.getElementById("contenedorProductos");
    contenedorProductos.innerHTML = "";
    console.log("-En renderProductos-")
    console.log(products)
    products.forEach(prod => {
        const card = document.createElement("div");
        card.innerHTML = `
                        <p> Código: ${prod.code} </p>
                        <p> Título: ${prod.title} </p>
                        <p> Precio: ${prod.price} </p>
                        <button> Eliminar </button>  
                        `;
        contenedorProductos.appendChild(card);

        //agregamos el evento al botón de eliminar
        //por acá, no se podría obtener el role que viene del handlebar????
        card.querySelector("button").addEventListener("click", () => {
            eliminarProducto(prod._id, userRole);
        })
    })
}

const eliminarProducto = (id, role) => {
    // logger.info("eliminando");
    socket.emit("eliminarProducto", id, role);
}

document.getElementById("btnEnviar").addEventListener("click", () => {
    agregarProducto();
})

const agregarProducto = () => {
    // logger.info("dentro de agregarProducto en main.js");
    const actual_owner = document.getElementById("email").value
    console.log(`Se agrego un producto con: ${actual_owner}`);
    const product = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: Number(document.getElementById("price").value),
        code: document.getElementById("code").value,
        stock: Number(document.getElementById("stock").value),
        status: document.getElementById("status").value === "true",
        category: document.getElementById("category").value,
        thumbnail: document.getElementById("thumbnail").value,
        owner: actual_owner === "adminCoder@coder.com" ? "admin" : actual_owner
        // owner: document.getElementById("email").value
    }
    // logger.info(`product en main.js: ${JSON.stringify(product, null, 2)}`)
    socket.emit("agregarProducto", product);
}