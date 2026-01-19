// Check auth on load
async function checkAdminAuth() {
    const session = await auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return false;
    }
    
    const isAdmin = await auth.isAdmin();
    if (!isAdmin) {
        alert('No tienes permisos de administrador');
        await auth.signOut();
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    if (confirm('¿Seguro que deseas cerrar sesión?')) {
        await auth.signOut();
        window.location.href = 'login.html';
    }
});

// DOM Elements
const pendingList = document.getElementById('pendingList');
const approvedList = document.getElementById('approvedList');
const pendingCount = document.getElementById('pendingCount');
const approvedCount = document.getElementById('approvedCount');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editEventForm');
const editDateType = document.getElementById('editDateType');
const editExactFields = document.getElementById('editExactFields');
const editMonthFields = document.getElementById('editMonthFields');
const editYear = document.getElementById('editYear');

let currentEditingEvent = null;

// Populate year select for edit modal
const currentYear = new Date().getFullYear();
for (let year = currentYear; year <= currentYear + 5; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    editYear.appendChild(option);
}

// Handle date type change in edit modal
editDateType.addEventListener('change', (e) => {
    const type = e.target.value;
    editExactFields.style.display = 'none';
    editMonthFields.style.display = 'none';
    
    if (type === 'exact') {
        editExactFields.style.display = 'block';
    } else if (type === 'month') {
        editMonthFields.style.display = 'block';
    }
});

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
    });
});

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

// Render pending events
async function renderPendingEvents() {
    pendingList.innerHTML = '<p style="text-align: center; padding: 2rem;">Cargando...</p>';
    
    const result = await db.getPendingEvents();
    
    if (!result.success) {
        pendingList.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Error: ${result.error}</p>`;
        return;
    }
    
    const events = result.data || [];
    pendingCount.textContent = events.length;
    
    if (events.length === 0) {
        pendingList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>No hay solicitudes pendientes</h3>
                <p>Las nuevas solicitudes aparecerán aquí</p>
            </div>
        `;
        return;
    }
    
    pendingList.innerHTML = events.map(event => `
        <div class="admin-event-card">
            <div class="admin-event-header">
                <div class="admin-event-info">
                    <h3 class="admin-event-title">${event.title}</h3>
                    <div class="admin-event-meta">
                        <span>👤 ${event.organizer}</span>
                        <span>👥 ${event.audience}</span>
                        <span>📍 ${event.mode}</span>
                        ${event.date ? `<span>📅 ${formatDate(event.date)}</span>` : 
                          event.month && event.year ? `<span>📅 ${formatMonthYear(event.month, event.year)}</span>` :
                          '<span>📅 Fecha por confirmar</span>'}
                    </div>
                </div>
                <div class="admin-event-actions">
                    <button class="action-button btn-edit" onclick="editEvent(${event.id}, 'pending')">
                        Editar
                    </button>
                    <button class="action-button btn-approve" onclick="approveEvent(${event.id})">
                        Aprobar
                    </button>
                    <button class="action-button btn-reject" onclick="rejectEvent(${event.id})">
                        Rechazar
                    </button>
                </div>
            </div>
            
            <p class="admin-event-description">${event.description}</p>
            
            <div class="admin-event-details">
                ${event.location ? `
                    <div class="admin-detail-item">
                        <span class="admin-detail-label">Ubicación</span>
                        <span class="admin-detail-value">${event.location}</span>
                    </div>
                ` : ''}
                ${event.time ? `
                    <div class="admin-detail-item">
                        <span class="admin-detail-label">Hora</span>
                        <span class="admin-detail-value">${event.time}</span>
                    </div>
                ` : ''}
                ${event.created_at ? `
                    <div class="admin-detail-item">
                        <span class="admin-detail-label">Enviado</span>
                        <span class="admin-detail-value">${formatDate(event.created_at)}</span>
                    </div>
                ` : ''}
            </div>
            
            ${event.info_link || event.register_link ? `
                <div class="event-links-admin">
                    ${event.info_link ? `<a href="${event.info_link}" target="_blank" class="event-link-admin">🔗 Información</a>` : ''}
                    ${event.register_link ? `<a href="${event.register_link}" target="_blank" class="event-link-admin">📝 Registro</a>` : ''}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Render approved events
async function renderApprovedEvents() {
    approvedList.innerHTML = '<p style="text-align: center; padding: 2rem;">Cargando...</p>';
    
    const result = await db.getApprovedEvents();
    
    if (!result.success) {
        approvedList.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Error: ${result.error}</p>`;
        return;
    }
    
    const events = result.data || [];
    approvedCount.textContent = events.length;
    
    if (events.length === 0) {
        approvedList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>No hay eventos publicados</h3>
                <p>Los eventos aprobados aparecerán aquí</p>
            </div>
        `;
        return;
    }
    
    approvedList.innerHTML = events.map(event => `
        <div class="admin-event-card">
            <div class="admin-event-header">
                <div class="admin-event-info">
                    <h3 class="admin-event-title">${event.title}</h3>
                    <div class="admin-event-meta">
                        <span>👤 ${event.organizer}</span>
                        <span>👥 ${event.audience}</span>
                        <span>📍 ${event.mode}</span>
                        ${event.date ? `<span>📅 ${formatDate(event.date)}</span>` : 
                          event.month && event.year ? `<span>📅 ${formatMonthYear(event.month, event.year)}</span>` :
                          '<span>📅 Fecha por confirmar</span>'}
                    </div>
                </div>
                <div class="admin-event-actions">
                    <button class="action-button btn-edit" onclick="editEvent(${event.id}, 'approved')">
                        Editar
                    </button>
                    <button class="action-button btn-delete" onclick="deleteEvent(${event.id})">
                        Eliminar
                    </button>
                </div>
            </div>
            
            <p class="admin-event-description">${event.description}</p>
            
            <div class="admin-event-details">
                ${event.location ? `
                    <div class="admin-detail-item">
                        <span class="admin-detail-label">Ubicación</span>
                        <span class="admin-detail-value">${event.location}</span>
                    </div>
                ` : ''}
                ${event.time ? `
                    <div class="admin-detail-item">
                        <span class="admin-detail-label">Hora</span>
                        <span class="admin-detail-value">${event.time}</span>
                    </div>
                ` : ''}
                ${event.provider ? `
                    <div class="admin-detail-item">
                        <span class="admin-detail-label">Info compartida por</span>
                        <span class="admin-detail-value">${event.provider}</span>
                    </div>
                ` : ''}
            </div>
            
            ${event.info_link || event.register_link ? `
                <div class="event-links-admin">
                    ${event.info_link ? `<a href="${event.info_link}" target="_blank" class="event-link-admin">🔗 Información</a>` : ''}
                    ${event.register_link ? `<a href="${event.register_link}" target="_blank" class="event-link-admin">📝 Registro</a>` : ''}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Approve event
async function approveEvent(id) {
    if (!confirm('¿Aprobar este evento?')) return;
    
    const result = await db.approveEvent(id);
    
    if (result.success) {
        alert('Evento aprobado exitosamente');
        await renderAll();
    } else {
        alert(`Error al aprobar evento: ${result.error}`);
    }
}

// Reject event
async function rejectEvent(id) {
    if (!confirm('¿Rechazar esta solicitud? Esta acción no se puede deshacer.')) return;
    
    const result = await db.rejectEvent(id);
    
    if (result.success) {
        alert('Solicitud rechazada');
        await renderAll();
    } else {
        alert(`Error al rechazar evento: ${result.error}`);
    }
}

// Delete event
async function deleteEvent(id) {
    if (!confirm('¿Eliminar este evento? Esta acción no se puede deshacer.')) return;
    
    const result = await db.deleteEvent(id);
    
    if (result.success) {
        alert('Evento eliminado');
        await renderAll();
    } else {
        alert(`Error al eliminar evento: ${result.error}`);
    }
}

// Edit event
async function editEvent(id, source) {
    // Fetch event data
    const result = source === 'pending' 
        ? await db.getPendingEvents()
        : await db.getApprovedEvents();
    
    if (!result.success) {
        alert('Error al cargar evento');
        return;
    }
    
    const event = result.data.find(e => e.id === id);
    if (!event) return;
    
    currentEditingEvent = { event, source };
    
    // Fill form
    document.getElementById('editEventId').value = event.id;
    document.getElementById('editTitle').value = event.title;
    document.getElementById('editDescription').value = event.description;
    document.getElementById('editOrganizer').value = event.organizer;
    document.getElementById('editProvider').value = event.provider || '';
    document.getElementById('editAudience').value = event.audience;
    document.getElementById('editMode').value = event.mode;
    document.getElementById('editDateType').value = event.date_type || 'pending';
    document.getElementById('editDate').value = event.date || '';
    document.getElementById('editTime').value = event.time || '';
    document.getElementById('editMonth').value = event.month || '';
    document.getElementById('editYear').value = event.year || '';
    document.getElementById('editLocation').value = event.location || '';
    document.getElementById('editInfoLink').value = event.info_link || '';
    document.getElementById('editRegisterLink').value = event.register_link || '';
    
    // Trigger date type change to show correct fields
    editDateType.dispatchEvent(new Event('change'));
    
    editModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Make functions globally accessible
window.approveEvent = approveEvent;
window.rejectEvent = rejectEvent;
window.deleteEvent = deleteEvent;
window.editEvent = editEvent;

// Close edit modal
function closeEditModal() {
    editModal.classList.remove('active');
    document.body.style.overflow = '';
    currentEditingEvent = null;
}

window.closeEditModal = closeEditModal;

// Save edited event
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentEditingEvent) return;
    
    const dateType = document.getElementById('editDateType').value;
    
    const updatedEvent = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        organizer: document.getElementById('editOrganizer').value,
        provider: document.getElementById('editProvider').value || null,
        audience: document.getElementById('editAudience').value,
        mode: document.getElementById('editMode').value,
        date_type: dateType,
        location: document.getElementById('editLocation').value || null,
        info_link: document.getElementById('editInfoLink').value || null,
        register_link: document.getElementById('editRegisterLink').value || null
    };
    
    // Handle date based on type
    if (dateType === 'exact') {
        updatedEvent.date = document.getElementById('editDate').value;
        updatedEvent.time = document.getElementById('editTime').value || null;
        updatedEvent.month = null;
        updatedEvent.year = null;
    } else if (dateType === 'month') {
        updatedEvent.month = parseInt(document.getElementById('editMonth').value);
        updatedEvent.year = parseInt(document.getElementById('editYear').value);
        updatedEvent.date = null;
        updatedEvent.time = null;
    } else {
        updatedEvent.date = null;
        updatedEvent.time = null;
        updatedEvent.month = null;
        updatedEvent.year = null;
    }
    
    const result = await db.updateEvent(currentEditingEvent.event.id, updatedEvent);
    
    if (result.success) {
        alert('Evento actualizado exitosamente');
        closeEditModal();
        await renderAll();
    } else {
        alert(`Error al actualizar evento: ${result.error}`);
    }
});

// Close modal on overlay click
document.querySelector('.modal-overlay').addEventListener('click', closeEditModal);
document.querySelector('.modal-close').addEventListener('click', closeEditModal);

// Render all
async function renderAll() {
    await renderPendingEvents();
    await renderApprovedEvents();
}

// Initialize
(async () => {
    const authenticated = await checkAdminAuth();
    if (authenticated) {
        await renderAll();
    }
})();