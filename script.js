// 1. IMPORTACIONES DE FIREBASE (URLs completas para evitar errores de CORS)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// 2. CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyCMUGhD0kHv6jlmHn8Sl1D11lab4fwsUnk", 
    authDomain: "nicoli-shop.firebaseapp.com",
    databaseURL: "https://nicoli-shop-default-rtdb.firebaseio.com",
    projectId: "nicoli-shop",
    storageBucket: "nicoli-shop.firebasestorage.app",
    messagingSenderId: "192238185780",
    appId: "1:192238185780:web:d0cc1761a3061031dc4961"
};

// Inicializar Firebase
const fbApp = initializeApp(firebaseConfig);
const db = getDatabase(fbApp);

const app = document.getElementById('app');

// --- 3. NAVEGACIÓN SPA (Single Page Application) ---
async function navigate(page) {
    app.style.opacity = "0"; 

    try {
        const response = await fetch(`pages/${page}.html`);
        if (!response.ok) throw new Error("Sección no encontrada");
        
        const html = await response.text();
        
        setTimeout(() => {
            app.innerHTML = html;
            window.scrollTo(0, 0);
            app.style.opacity = "1";
            app.className = "fade-in";
            localStorage.setItem('lastSection', page);

            // Cargar productos de Firebase si estamos en una categoría o inicio
            const categorias = ['maquillaje', 'perfumes', 'cremas', 'inicio'];
            if (categorias.includes(page)) {
                injectAdminProducts(page);
            }
        }, 200);

    } catch (err) {
        app.innerHTML = `
            <div style="padding:50px; text-align:center;">
                <h1>${page.toUpperCase()}</h1>
                <p>Contenido en mantenimiento o no encontrado.</p>
            </div>`;
        app.style.opacity = "1";
    }
}

// --- 4. LÓGICA DE PRODUCTOS DESDE FIREBASE ---
function injectAdminProducts(seccion) {
    const contenedor = app.querySelector('.product-grid');
    if (!contenedor) return;

    const productosRef = ref(db, 'productos');

    onValue(productosRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            contenedor.innerHTML = "<p>No hay productos disponibles por ahora.</p>";
            return;
        }

        // Limpiamos solo los productos dinámicos para evitar duplicados
        contenedor.innerHTML = "";

        // Convertimos el objeto de Firebase en Array y filtramos por sección
        Object.values(data).forEach(p => {
            // Si la sección coincide o si estamos en 'inicio' (mostramos todo en inicio)
            if (p.seccion === seccion || seccion === 'inicio') {
                const card = document.createElement('div');
                card.className = 'card card-firebase';
                card.innerHTML = `
                    <img src="${p.imagen}" onerror="this.src='https://via.placeholder.com/150'">
                    <p>${p.nombre.toUpperCase()}</p>
                    <p class="price">R$ ${p.precio}</p>
                    <button class="btn-add">ADICIONAR</button>
                `;
                contenedor.appendChild(card);
            }
        });
    });
}

// --- 5. EVENTOS DE CLIC GLOBALES ---
document.addEventListener('click', (e) => {
    const link = e.target.closest('.nav-link');
    if (link) {
        e.preventDefault();
        const page = link.getAttribute('data-link');
        navigate(page);
    }
    
    // Cerrar menú extra si se hace clic fuera
    const extraDropdown = document.getElementById('extraDropdown');
    const extraBtn = document.getElementById('extraBtn');
    if (extraDropdown && extraBtn && !extraBtn.contains(e.target) && !extraDropdown.contains(e.target)) {
        extraDropdown.classList.remove('show');
    }
});

// --- 6. MENÚ EXTRA (+) ---
document.addEventListener('click', (e) => {
    const extraBtn = e.target.closest('#extraBtn');
    if (extraBtn) {
        const dropdown = document.getElementById('extraDropdown');
        dropdown.classList.toggle('show');
    }
});

// --- 7. CARRUSEL INFINITO ---
function initInfiniteCarousel() {
    const track = document.getElementById('carouselTrack');
    const slides = document.querySelectorAll('.slide-item');
    if (!track || slides.length === 0) return;

    // Clonar el primero para el efecto infinito
    const firstClone = slides[0].cloneNode(true);
    track.appendChild(firstClone);

    let index = 0;
    setInterval(() => {
        index++;
        track.style.transition = "transform 0.6s ease-in-out";
        track.style.transform = `translateX(-${index * 100}%)`;

        if (index === slides.length) {
            setTimeout(() => {
                track.style.transition = "none";
                track.style.transform = "translateX(0)";
                index = 0;
            }, 600);
        }
    }, 3500); 
}

// --- 8. CARGA INICIAL ---
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('lastSection') || 'inicio';
    navigate(saved);
    initInfiniteCarousel();
});