const form = document.getElementById('productForm');
const list = document.getElementById('admin-list');

// Cargar y mostrar productos
function displayProducts() {
    const products = JSON.parse(localStorage.getItem('misProductos')) || [];
    list.innerHTML = "";

    products.forEach((p, index) => {
        list.innerHTML += `
            <div class="admin-item">
                <img src="${p.imagen}">
                <p><b>${p.nombre}</b></p>
                <p>R$ ${p.precio}</p>
                <button class="btn-delete" onclick="deleteProduct(${index})">Eliminar</button>
            </div>
        `;
    });
}

// Guardar producto
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newProd = {
        nombre: document.getElementById('p-nombre').value,
        seccion: document.getElementById('p-seccion').value,
        precio: document.getElementById('p-precio').value,
        imagen: document.getElementById('p-imagen').value
    };

    const products = JSON.parse(localStorage.getItem('misProductos')) || [];
    products.push(newProd);
    localStorage.setItem('misProductos', JSON.stringify(products));
    
    form.reset();
    displayProducts();
});

// Eliminar producto
window.deleteProduct = (index) => {
    const products = JSON.parse(localStorage.getItem('misProductos')) || [];
    products.splice(index, 1);
    localStorage.setItem('misProductos', JSON.stringify(products));
    displayProducts();
};

displayProducts();
