// 1. IMPORTACIONES DE FIREBASE (URLs completas y con versión)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// 2. TU CONFIGURACIÓN
const firebaseConfig = {
  apiKey: "AIzaSyCMUGhD0kHv6jlmHn8Sl1D11lab4fwsUnk", 
  authDomain: "nicoli-shop.firebaseapp.com", // Asegúrate de que esto esté bien escrito
  databaseURL: "https://nicoli-shop-default-rtdb.firebaseio.com", // Generalmente lleva el ID del proyecto
  projectId: "nicoli-shop",
  storageBucket: "nicoli-shop.firebasestorage.app",
  messagingSenderId: "192238185780",
  appId: "1:192238185780:web:d0cc1761a3061031dc4961"
};

// Inicializar Firebase
const fbApp = initializeApp(firebaseConfig);
const db = getDatabase(fbApp);

const app = document.getElementById('app');

// --- NAVEGACIÓN SPA ---
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

            // Inyectar productos desde Firebase
            if (['maquillaje', 'perfumes', 'cremas', 'inicio'].includes(page)) {
                injectAdminProducts(page);
            }
        }, 200);

    } catch (err) {
        app.innerHTML = `<div style="padding:50px; text-align:center;">
                            <h1>${page.toUpperCase()}</h1>
                            <p>Contenido en mantenimiento...</p>
                         </div>`;
        app.style.opacity = "1";
    }
}

// --- LÓGICA DE PRODUCTOS DINÁMICOS (FIREBASE) ---
function injectAdminProducts(seccion) {
    const contenedor = app.querySelector('.product-grid');
    if (!contenedor) return;

    // Referencia a la rama 'productos' en Firebase
    const productosRef = ref(db, 'productos');

    // Escuchar datos en tiempo real
    onValue(productosRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // Limpiar productos previos cargados dinámicamente para no duplicar
        const cardsDinamicas = contenedor.querySelectorAll('.card-firebase');
        cardsDinamicas.forEach(c => c.remove());

        // Filtrar e inyectar
        Object.values(data).filter(p => p.seccion === seccion).forEach(p => {
            const card = document.createElement('div');
            card.className = 'card card-firebase';
            card.innerHTML = `
                <img src="${p.imagen}" onerror="this.src='https://placeholder.com'">
                <p>${p.nombre.toUpperCase()}</p>
                <p class="price">R$ ${p.precio}</p>
                <button class="btn-add">ADICIONAR</button>
            `;
            contenedor.appendChild(card);
        });
    });
}

// --- EVENTOS DE CLIC ---
document.addEventListener('click', (e) => {
    const link = e.target.closest('.nav-link');
    if (link) {
        e.preventDefault();
        const page = link.getAttribute('data-link');
        navigate(page);
    }
    
    // Cerrar dropdown al hacer clic fuera
    if (extraDropdown && !extraBtn.contains(e.target) && !extraDropdown.contains(e.target)) {
        extraDropdown.classList.remove('show');
    }
});

// --- MENÚ EXTRA (+) ---
const extraBtn = document.getElementById('extraBtn');
const extraDropdown = document.getElementById('extraDropdown');

if (extraBtn) {
    extraBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        extraDropdown.classList.toggle('show');
    });
}

// --- CARRUSEL INFINITO ---
function initInfiniteCarousel() {
    const track = document.getElementById('carouselTrack');
    const slides = document.querySelectorAll('.slide-item');
    if (!track || slides.length === 0) return;

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

// --- CARGA INICIAL ---
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('lastSection') || 'inicio';
    navigate(saved);
    initInfiniteCarousel();
});
