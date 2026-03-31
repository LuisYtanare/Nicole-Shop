// 1. IMPORTACIONES DE FIREBASE (Corregidas con versión 10.8.1)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// 2. CONFIGURACIÓN (Ajustada para que conecte realmente)
const firebaseConfig = {
  apiKey: "AIzaSyCMUGhD0kHv6jlmHn8Sl1D11lab4fwsUnk", 
  authDomain: "nicoli-shop.firebaseapp.com",
  databaseURL: "https://nicoli-shop-default-rtdb.firebaseio.com", // O la URL que aparezca en tu consola de Firebase
  projectId: "nicoli-shop",
  storageBucket: "nicoli-shop.firebasestorage.app",
  messagingSenderId: "192238185780",
  appId: "1:192238185780:web:d0cc1761a3061031dc4961"
};

// 3. INICIALIZACIÓN
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const form = document.getElementById('productForm');
const list = document.getElementById('admin-list');

// 4. MOSTRAR PRODUCTOS (Optimizado para no duplicar eventos)
function displayProducts() {
    const productosRef = ref(db, 'productos');

    onValue(productosRef, (snapshot) => {
        const data = snapshot.val();
        list.innerHTML = ""; 

        if (data) {
            Object.keys(data).forEach((id) => {
                const p = data[id];
                // Creamos el elemento para poder asignarle el evento directamente
                const item = document.createElement('div');
                item.className = 'admin-item';
                item.innerHTML = `
                    <img src="${p.imagen}" onerror="this.src='https://via.placeholder.com/150'">
                    <p><b>${p.nombre}</b></p>
                    <p>R$ ${p.precio}</p>
                    <button class="btn-delete" data-id="${id}">Eliminar</button>
                `;
                
                // Evento de eliminar directamente al botón de este item
                item.querySelector('.btn-delete').addEventListener('click', () => deleteProduct(id));
                
                list.appendChild(item);
            });
        } else {
            list.innerHTML = "<p>No hay productos registrados.</p>";
        }
    });
}

// 5. GUARDAR PRODUCTO
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newProd = {
        nombre: document.getElementById('p-nombre').value,
        seccion: document.getElementById('p-seccion').value,
        precio: document.getElementById('p-precio').value,
        imagen: document.getElementById('p-imagen').value
    };

    const productosRef = ref(db, 'productos');
    push(productosRef, newProd)
        .then(() => {
            alert("✨ ¡Producto guardado en la nube!");
            form.reset();
        })
        .catch((error) => alert("Error: " + error.message));
});

// 6. ELIMINAR PRODUCTO
function deleteProduct(id) {
    if (confirm("¿Seguro que quieres eliminar este producto?")) {
        const prodRef = ref(db, `productos/${id}`);
        remove(prodRef)
            .then(() => console.log("Eliminado correctamente"))
            .catch((error) => console.error("Error al eliminar:", error));
    }
}

// Carga inicial
displayProducts();