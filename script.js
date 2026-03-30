const app = document.getElementById('app');

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

            // === MEJORA: Inyectar productos del admin automáticamente ===
            // Solo lo intentamos si la página cargada es una de las categorías
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

// --- LÓGICA DE PRODUCTOS DINÁMICOS ---
function injectAdminProducts(seccion) {
    // Buscamos el contenedor donde van los productos en el HTML cargado
    const contenedor = app.querySelector('.product-grid');
    if (!contenedor) return;

    const db = JSON.parse(localStorage.getItem('misProductos')) || [];
    const filtrados = db.filter(p => p.seccion === seccion);

    filtrados.forEach(p => {
        contenedor.innerHTML += `
            <div class="card">
                <img src="${p.imagen}" onerror="this.src='https://via.placeholder.com'">
                <p>${p.nombre.toUpperCase()}</p>
                <p class="price">R$ ${p.precio}</p>
                <button class="btn-add">ADICIONAR</button>
            </div>`;
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
