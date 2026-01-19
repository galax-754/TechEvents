// DOM Elements
const eventsGrid = document.getElementById('eventsGrid');
const eventModal = document.getElementById('eventModal');
const modalContent = document.querySelector('.modal-content');
const submitForm = document.getElementById('submitEventForm');
const navbar = document.querySelector('.navbar');
const eventImageInput = document.getElementById('eventImage');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');
const imageHelp = document.getElementById('imageHelp');

// Mobile menu elements
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinksContainer = document.getElementById('navLinks');

// Usar window.db y window.auth directamente para evitar problemas de scope
// NO crear alias local para evitar conflictos
if (typeof window.db === 'undefined') {
    console.error('window.db is not available. Make sure config/supabase.js is loaded before this file.');
}
if (typeof window.auth === 'undefined') {
    console.error('window.auth is not available. Make sure config/supabase.js is loaded before this file.');
}

// Filters
const modeFilter = document.getElementById('modeFilter');
const audienceFilter = document.getElementById('audienceFilter');
const dateFilter = document.getElementById('dateFilter');

// Date type handling
const dateTypeSelect = document.getElementById('dateType');
const exactDateFields = document.getElementById('exactDateFields');
const monthFields = document.getElementById('monthFields');
const yearSelect = document.getElementById('yearSelect');

// Populate year select
const currentYear = new Date().getFullYear();
for (let year = currentYear; year <= currentYear + 5; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
}

// Handle date type selection
dateTypeSelect.addEventListener('change', (e) => {
    const type = e.target.value;
    
    exactDateFields.style.display = 'none';
    monthFields.style.display = 'none';
    
    // Reset required attributes
    document.getElementById('exactDate').removeAttribute('required');
    document.getElementById('monthSelect').removeAttribute('required');
    document.getElementById('yearSelect').removeAttribute('required');
    
    if (type === 'exact') {
        exactDateFields.style.display = 'block';
        document.getElementById('exactDate').setAttribute('required', 'required');
    } else if (type === 'month') {
        monthFields.style.display = 'block';
        document.getElementById('monthSelect').setAttribute('required', 'required');
        document.getElementById('yearSelect').setAttribute('required', 'required');
    }
});

// Mobile menu toggle
if (mobileMenuToggle && navLinksContainer) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navLinksContainer.classList.toggle('active');
    });

    // Close mobile menu when clicking nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navLinksContainer.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenuToggle.contains(e.target) && !navLinksContainer.contains(e.target)) {
            mobileMenuToggle.classList.remove('active');
            navLinksContainer.classList.remove('active');
        }
    });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ---- Image upload helpers (JPG/PNG, max 5MB) ----
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_ALLOWED_TYPES = new Set(['image/jpeg', 'image/png']);

// ---- Basic client-side rate limiting (best-effort, not a security boundary) ----
function rateLimitCheck(key, limit, windowMs) {
    try {
        const now = Date.now();
        const raw = localStorage.getItem(key);
        const data = raw ? JSON.parse(raw) : { start: now, count: 0 };

        if (!data.start || (now - data.start) > windowMs) {
            data.start = now;
            data.count = 0;
        }

        if (data.count >= limit) {
            const retryInMs = Math.max(0, windowMs - (now - data.start));
            return { allowed: false, retryInMs };
        }

        data.count += 1;
        localStorage.setItem(key, JSON.stringify(data));
        return { allowed: true };
    } catch {
        // Si localStorage falla, no bloqueamos
        return { allowed: true };
    }
}

async function getImageDimensions(file) {
    const url = URL.createObjectURL(file);
    try {
        const img = new Image();
        const loaded = new Promise((resolve, reject) => {
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = () => reject(new Error('No se pudo leer la imagen'));
        });
        img.src = url;
        return await loaded;
    } finally {
        URL.revokeObjectURL(url);
    }
}

async function validateEventImageFile(file) {
    if (!file) return { ok: true };

    if (!IMAGE_ALLOWED_TYPES.has(file.type)) {
        return { ok: false, error: 'Formato inválido. Solo se permiten JPG o PNG.' };
    }
    if (file.size > IMAGE_MAX_BYTES) {
        return { ok: false, error: 'La imagen excede 5MB. Por favor usa una imagen más ligera.' };
    }

    // Dimensiones máximas razonables (seguridad/performance)
    const { width, height } = await getImageDimensions(file);
    if (width > 4000 || height > 4000) {
        return { ok: false, error: 'La imagen es demasiado grande (máx 4000x4000 px).' };
    }
    return { ok: true };
}

if (eventImageInput) {
    eventImageInput.addEventListener('change', async () => {
        const file = eventImageInput.files && eventImageInput.files[0];
        if (!file) {
            imagePreviewContainer.style.display = 'none';
            imagePreview.src = '';
            imageHelp.textContent = 'Si no subes imagen, se usará la imagen por defecto.';
            return;
        }

        const validation = await validateEventImageFile(file);
        if (!validation.ok) {
            alert(validation.error);
            eventImageInput.value = '';
            imagePreviewContainer.style.display = 'none';
            imagePreview.src = '';
            imageHelp.textContent = 'Si no subes imagen, se usará la imagen por defecto.';
            return;
        }

        // Preview
        const previewUrl = URL.createObjectURL(file);
        imagePreview.src = previewUrl;
        imagePreview.onload = () => URL.revokeObjectURL(previewUrl);
        imagePreviewContainer.style.display = 'block';
        imageHelp.textContent = 'Imagen válida. Se subirá cuando envíes el evento.';
    });
}

// Format date
function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Format month/year
function formatMonthYear(month, year) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[month - 1]} ${year}`;
}

// Get date badge
function getDateBadge(event) {
    if (event.date_type === 'pending' || (!event.date && !event.month)) {
        return '<span class="badge badge-status">PRÓXIMAMENTE</span>';
    } else if (event.date_type === 'month' && event.month && event.year) {
        return `<span class="badge badge-date">${formatMonthYear(event.month, event.year).toUpperCase()}</span>`;
    } else if (event.date) {
        return `<span class="badge badge-date">${formatDate(event.date).toUpperCase()}</span>`;
    }
    return '<span class="badge badge-status">FECHA POR CONFIRMAR</span>';
}

// Get mode badge
function getModeBadge(mode) {
    const modeLabels = {
        'virtual': '💻 VIRTUAL',
        'presencial': '📍 PRESENCIAL',
        'hibrido': '🔄 HÍBRIDO'
    };
    return `<span class="badge badge-mode">${modeLabels[mode] || mode}</span>`;
}

// Render events
async function renderEvents() {
    eventsGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0;"><p>Cargando eventos...</p></div>';
    
    try {
        // Verificar que db esté disponible
        if (typeof window.db === 'undefined' || !window.db.getApprovedEvents) {
            console.error('Error: db object not available');
            eventsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--text-secondary);">
                    <p style="font-size: 1.25rem;">Error de configuración</p>
                    <p style="margin-top: 0.5rem; font-size: 0.875rem;">No se pudo conectar con la base de datos. Verifica la consola para más detalles.</p>
                </div>
            `;
            return;
        }

        const result = await window.db.getApprovedEvents();
        
        if (!result.success) {
            console.error('Error loading events:', result.error);
            eventsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--text-secondary);">
                    <p style="font-size: 1.25rem;">Error al cargar eventos</p>
                    <p style="margin-top: 0.5rem; font-size: 0.875rem;">${result.error || 'Error desconocido'}</p>
                    <p style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-secondary);">Abre la consola del navegador (F12) para más detalles</p>
                </div>
            `;
            return;
        }
        
        const events = result.data || [];
        
        if (events.length === 0) {
            eventsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--text-secondary);">
                    <p style="font-size: 1.25rem;">No hay eventos disponibles</p>
                    <p style="margin-top: 0.5rem; font-size: 0.875rem;">Los eventos aparecerán aquí una vez que sean aprobados por un administrador.</p>
                </div>
            `;
            return;
        }
        
        console.log(`Cargados ${events.length} eventos exitosamente`);
        
        // Renderizar eventos
        eventsGrid.innerHTML = '';
        
        events.forEach((event, index) => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Corregir ruta de imagen - asegurar que sea relativa desde la raíz
        let imagePath = event.image || '/public/fondo_por_defecto_en_eventos_sin_imagen.jpg';
        if (!imagePath.startsWith('http') && !imagePath.startsWith('/')) {
            imagePath = '/' + imagePath;
        }
        
        card.innerHTML = `
            <div class="event-poster-container">
                <img src="${imagePath}" alt="${event.title}" class="event-poster" onerror="this.src='/public/fondo_por_defecto_en_eventos_sin_imagen.jpg'">
                <div class="event-info-bar">
                    <div class="event-info-content">
                        <h3 class="event-title">${event.title}</h3>
                    </div>
                    <button class="event-view-more" onclick="showEventDetail(${event.id})">
                        Ver más
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8h10m0 0l-3-3m3 3l-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        eventsGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error inesperado al cargar eventos:', error);
        eventsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--text-secondary);">
                <p style="font-size: 1.25rem;">Error inesperado</p>
                <p style="margin-top: 0.5rem; font-size: 0.875rem;">${error.message || 'Error desconocido'}</p>
                <p style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-secondary);">Abre la consola del navegador (F12) para más detalles</p>
            </div>
        `;
    }
}

// Show event detail
async function showEventDetail(eventId) {
    const result = await window.db.getApprovedEvents();
    if (!result.success) return;
    
    const event = result.data.find(e => e.id === eventId);
    if (!event) return;
    
    let metaItems = '';
    
    if (event.organizer) {
        metaItems += `
            <div class="meta-item">
                <span class="meta-label">Organizador</span>
                <span class="meta-value">${event.organizer}</span>
            </div>
        `;
    }
    
    if (event.audience) {
        const audienceLabels = {
            'estudiantes': 'Estudiantes',
            'profesionales': 'Profesionales',
            'general': 'Público General',
            'todos': 'Todos'
        };
        metaItems += `
            <div class="meta-item">
                <span class="meta-label">Audiencia</span>
                <span class="meta-value">${audienceLabels[event.audience]}</span>
            </div>
        `;
    }
    
    if (event.date) {
        metaItems += `
            <div class="meta-item">
                <span class="meta-label">Fecha</span>
                <span class="meta-value">${formatDate(event.date)}</span>
            </div>
        `;
    } else if (event.month && event.year) {
        metaItems += `
            <div class="meta-item">
                <span class="meta-label">Fecha Aproximada</span>
                <span class="meta-value">${formatMonthYear(event.month, event.year)}</span>
            </div>
        `;
    }
    
    if (event.time) {
        metaItems += `
            <div class="meta-item">
                <span class="meta-label">Hora</span>
                <span class="meta-value">${event.time}</span>
            </div>
        `;
    }
    
    if (event.location) {
        metaItems += `
            <div class="meta-item">
                <span class="meta-label">Ubicación</span>
                <span class="meta-value">${event.location}</span>
            </div>
        `;
    }
    
    if (event.provider) {
        metaItems += `
            <div class="meta-item">
                <span class="meta-label">Info compartida por</span>
                <span class="meta-value">${event.provider}</span>
            </div>
        `;
    }
    
    let linksHTML = '';
    if (event.info_link) {
        linksHTML += `<a href="${event.info_link}" target="_blank" rel="noopener noreferrer" class="modal-link">🔗 Más información</a>`;
    }
    if (event.register_link) {
        linksHTML += `<a href="${event.register_link}" target="_blank" rel="noopener noreferrer" class="modal-link">📝 Registrarse</a>`;
    }
    
    // Corregir ruta de imagen en modal
    let modalImagePath = event.image || '/public/fondo_por_defecto_en_eventos_sin_imagen.jpg';
    if (!modalImagePath.startsWith('http') && !modalImagePath.startsWith('/')) {
        modalImagePath = '/' + modalImagePath;
    }
    
    modalContent.innerHTML = `
        <button class="modal-close">&times;</button>
        <div class="modal-left">
            <img src="${modalImagePath}" alt="${event.title}" class="modal-poster" onerror="this.src='/public/fondo_por_defecto_en_eventos_sin_imagen.jpg'">
        </div>
        <div class="modal-right">
            <div class="modal-header">
                <h2 class="modal-title">${event.title}</h2>
                <div class="modal-badges">
                    ${getModeBadge(event.mode)}
                    ${getDateBadge(event)}
                </div>
            </div>
            
            ${metaItems ? `<div class="modal-meta">${metaItems}</div>` : ''}
            
            <div>
                <p class="modal-description">${event.description}</p>
            </div>
            
            ${linksHTML ? `<div class="modal-links">${linksHTML}</div>` : ''}
        </div>
    `;
    
    modalContent.querySelector('.modal-close').addEventListener('click', closeModal);
    
    eventModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Make showEventDetail globally accessible
window.showEventDetail = showEventDetail;

// Close modal
function closeModal() {
    eventModal.classList.remove('active');
    document.body.style.overflow = '';
}

document.querySelector('.modal-overlay').addEventListener('click', closeModal);

// Close modal with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && eventModal.classList.contains('active')) {
        closeModal();
    }
});

// Filter events (currently client-side, can be moved to Supabase for better performance)
async function filterEvents() {
    const mode = modeFilter.value;
    const audience = audienceFilter.value;
    const date = dateFilter.value;
    
    const result = await window.db.getApprovedEvents();
    if (!result.success) return;
    
    let filtered = result.data || [];
    
    if (mode !== 'all') {
        filtered = filtered.filter(e => e.mode === mode);
    }
    
    if (audience !== 'all') {
        filtered = filtered.filter(e => e.audience === audience || e.audience === 'todos');
    }
    
    if (date === 'upcoming') {
        filtered = filtered.filter(e => {
            if (!e.date) return true;
            return new Date(e.date) >= new Date();
        });
    } else if (date === 'past') {
        filtered = filtered.filter(e => {
            if (!e.date) return false;
            return new Date(e.date) < new Date();
        });
    }
    
    // Re-render with filtered data
    eventsGrid.innerHTML = '';
    
    if (filtered.length === 0) {
        eventsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--text-secondary);">
                <p style="font-size: 1.25rem;">No se encontraron eventos con estos filtros</p>
            </div>
        `;
        return;
    }
    
    filtered.forEach((event, index) => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Corregir ruta de imagen
        let imagePath = event.image || '/public/fondo_por_defecto_en_eventos_sin_imagen.jpg';
        if (!imagePath.startsWith('http') && !imagePath.startsWith('/')) {
            imagePath = '/' + imagePath;
        }
        
        card.innerHTML = `
            <div class="event-poster-container">
                <img src="${imagePath}" alt="${event.title}" class="event-poster" onerror="this.src='/public/fondo_por_defecto_en_eventos_sin_imagen.jpg'">
                <div class="event-info-bar">
                    <div class="event-info-content">
                        <h3 class="event-title">${event.title}</h3>
                    </div>
                    <button class="event-view-more" onclick="showEventDetail(${event.id})">
                        Ver más
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8h10m0 0l-3-3m3 3l-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        eventsGrid.appendChild(card);
    });
}

modeFilter.addEventListener('change', filterEvents);
audienceFilter.addEventListener('change', filterEvents);
dateFilter.addEventListener('change', filterEvents);

// Submit event form
submitForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Limitar envíos: 5 por hora y 10 por día (por navegador)
    const perHour = rateLimitCheck('techevents_submit_hour', 5, 60 * 60 * 1000);
    if (!perHour.allowed) {
        const mins = Math.ceil(perHour.retryInMs / 60000);
        alert(`Has alcanzado el límite de envíos. Intenta de nuevo en ~${mins} min.`);
        return;
    }
    const perDay = rateLimitCheck('techevents_submit_day', 10, 24 * 60 * 60 * 1000);
    if (!perDay.allowed) {
        const hours = Math.ceil(perDay.retryInMs / (60 * 60 * 1000));
        alert(`Has alcanzado el límite diario de envíos. Intenta de nuevo en ~${hours} h.`);
        return;
    }
    
    const formData = new FormData(submitForm);
    const dateType = formData.get('dateType');
    
    // Prepare event data based on date type
    const eventData = {
        title: formData.get('title'),
        description: formData.get('description'),
        organizer: formData.get('organizer'),
        audience: formData.get('audience'),
        mode: formData.get('mode'),
        date_type: dateType,
        location: formData.get('location') || null,
        info_link: formData.get('infoLink') || null,
        register_link: formData.get('registerLink') || null,
        image: '/public/fondo_por_defecto_en_eventos_sin_imagen.jpg'
    };
    
    // Handle date based on type
    if (dateType === 'exact') {
        eventData.date = formData.get('date');
        eventData.time = formData.get('time') || null;
    } else if (dateType === 'month') {
        eventData.month = parseInt(formData.get('month'));
        eventData.year = parseInt(formData.get('year'));
    }
    
    // Disable button and show loading
    const submitButton = submitForm.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
    
    try {
        // 1) Subir imagen (si existe) a Supabase Storage
        const selectedFile = eventImageInput?.files?.[0] || null;
        if (selectedFile) {
            const validation = await validateEventImageFile(selectedFile);
            if (!validation.ok) {
                alert(validation.error);
                return;
            }

            if (!window.techeventsStorage || !window.techeventsStorage.uploadPendingEventImage) {
                console.error('Storage helper no disponible (techeventsStorage)');
            } else {
                submitButton.textContent = 'Subiendo imagen...';
                const upload = await window.techeventsStorage.uploadPendingEventImage(selectedFile);
                if (upload.success && upload.publicUrl) {
                    eventData.image = upload.publicUrl;
                } else {
                    console.warn('No se pudo subir imagen, se usará la imagen por defecto:', upload.error);
                }
            }
        }

        // 2) Crear evento en la DB (pending)
        submitButton.textContent = 'Guardando evento...';
        const result = await window.db.createEvent(eventData);
        
        if (result.success) {
            alert('¡Solicitud enviada exitosamente! Tu evento será revisado por un administrador.');
            submitForm.reset();
            if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
            if (imagePreview) imagePreview.src = '';
            dateTypeSelect.dispatchEvent(new Event('change'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            alert(`Error al enviar solicitud: ${result.error}`);
        }
    } catch (error) {
        console.error('Error submitting event:', error);
        alert('Error inesperado al enviar la solicitud');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Initialize - Load events on page load
document.addEventListener('DOMContentLoaded', () => {
    renderEvents();
});