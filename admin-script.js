// 1. IMPORTACIONES (Agregamos el módulo de AUTH)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// 2. CONFIGURACIÓN
const firebaseConfig = {
    apiKey: "AIzaSyCMUGhD0kHv6jlmHn8Sl1D11lab4fwsUnk", 
    authDomain: "nicoli-shop.firebaseapp.com",
    databaseURL: "https://nicoli-shop-default-rtdb.firebaseio.com",
    projectId: "nicoli-shop",
    storageBucket: "nicoli-shop.firebasestorage.app",
    messagingSenderId: "192238185780",
    appId: "1:192238185780:web:d0cc1761a3061031dc4961"
};

// 3. INICIALIZACIÓN
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app); // Inicializamos el sistema de usuarios

// ELEMENTOS DEL DOM
const loginSection = document.getElementById('login-section');
const adminContent = document.getElementById('admin-content');
const loginForm = document.getElementById('loginForm');
const btnLogout = document.getElementById('btn-logout');
const productForm = document.getElementById('productForm');
const list = document.getElementById('admin-list');

// --- 4. OBSERVADOR DE ESTADO DE AUTENTICACIÓN ---
// Este código se ejecuta automáticamente cuando entras o sales de la cuenta
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuario logueado: mostramos el panel y cargamos productos
        loginSection.style.display = "none";
        adminContent.style.display = "block";
        displayProducts(); 
    } else {
        // Usuario fuera: mostramos el login y ocultamos el panel
        loginSection.style.display = "block";
        adminContent.style.display = "none";
    }
});

// --- 5. LÓGICA DE INICIO DE SESIÓN ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    signInWithEmailAndPassword(auth, email, pass)
        .then(() => {
            console.log("Acceso concedido");
        })
        .catch((error) => {
            alert("Error: Usuario o contraseña incorrectos.");
            console.error(error.message);
        });
});

// --- 6. CERRAR SESIÓN ---
btnLogout.addEventListener('click', () => {
    signOut(auth).then(() => {
        alert("Has salido del panel.");
    });
});

// --- 7. MOSTRAR PRODUCTOS (Solo funciona si hay sesión activa) ---
function displayProducts() {
    const productosRef = ref(db, 'productos');

    onValue(productosRef, (snapshot) => {
        const data = snapshot.val();
        list.innerHTML = ""; 

        if (data) {
            Object.keys(data).forEach((id) => {
                const p = data[id];
                const item = document.createElement('div');
                item.className = 'admin-item';
                item.innerHTML = `
                    <img src="${p.imagen}" onerror="this.src='https://via.placeholder.com/150'">
                    <p><b>${p.nombre}</b></p>
                    <p>R$ ${p.precio}</p>
                    <button class="btn-delete" data-id="${id}">Eliminar</button>
                `;
                
                item.querySelector('.btn-delete').addEventListener('click', () => deleteProduct(id));
                list.appendChild(item);
            });
        } else {
            list.innerHTML = "<p>No hay productos registrados.</p>";
        }
    });
}

// --- 8. GUARDAR PRODUCTO ---
productForm.addEventListener('submit', (e) => {
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
            productForm.reset();
        })
        .catch((error) => alert("Error al guardar: " + error.message));
});

// --- 9. ELIMINAR PRODUCTO ---
function deleteProduct(id) {
    if (confirm("¿Seguro que quieres eliminar este producto?")) {
        const prodRef = ref(db, `productos/${id}`);
        remove(prodRef)
            .then(() => console.log("Eliminado correctamente"))
            .catch((error) => console.error("Error al eliminar:", error));
    }
}