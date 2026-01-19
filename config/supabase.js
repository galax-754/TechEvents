// Supabase Configuration
// IMPORTANT: These are PUBLIC keys that can be exposed in the frontend
// Never commit your service_role key to GitHub
//
// Para mayor seguridad, puedes crear config/config.js (basado en config/config.js.example)
// y usar SUPABASE_CONFIG desde ahí. Por ahora usamos valores por defecto.

// Intentar cargar configuración externa si existe, sino usar valores por defecto
let SUPABASE_URL, SUPABASE_ANON_KEY;

try {
    // Si existe config/config.js, usarlo (está en .gitignore)
    if (typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        SUPABASE_URL = SUPABASE_CONFIG.url;
        SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey;
    } else {
        // Valores por defecto (pueden estar hardcodeados porque son claves públicas)
        SUPABASE_URL = 'https://rzaiebqdmewhbjpmvtha.supabase.co';
        SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6YWllYnFkbWV3aGJqcG12dGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDU2MDQsImV4cCI6MjA4NDI4MTYwNH0.21PgG8moJdsZpB-pWHX77MMUCzOv8O4JEiNUq_1g3fo';
    }
} catch (e) {
    // Fallback a valores por defecto
    SUPABASE_URL = 'https://rzaiebqdmewhbjpmvtha.supabase.co';
    SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6YWllYnFkbWV3aGJqcG12dGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDU2MDQsImV4cCI6MjA4NDI4MTYwNH0.21PgG8moJdsZpB-pWHX77MMUCzOv8O4JEiNUq_1g3fo';
}

// Initialize Supabase client
// Nota importante:
// - El CDN UMD expone la LIBRERÍA como window.supabase (con createClient)
// - El CLIENTE lo creamos nosotros y lo guardamos como window.supabaseClient
// - NO debemos declarar "var supabase = ..." en el scope global porque eso PISA window.supabase
//   y rompe el SDK.
(function () {
    'use strict';

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        console.error('Supabase library not loaded or invalid. Ensure you load the UMD CDN before config/supabase.js');
        throw new Error('Supabase library not available');
    }

    try {
        console.log('🔧 Initializing Supabase client...');
        console.log('🔧 SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
        console.log('🔧 SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Set (' + SUPABASE_ANON_KEY.substring(0, 20) + '...)' : '❌ Missing');
        console.log('🔧 SUPABASE_ANON_KEY length:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.length : 0);
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,  // ✅ Permitir que la sesión persista en localStorage
                autoRefreshToken: true,  // ✅ Refrescar token automáticamente
                detectSessionInUrl: false  // No necesario para este caso
            }
        });
        console.log('✅ Supabase client initialized successfully');
        console.log('✅ Client URL:', window.supabaseClient.supabaseUrl);
        console.log('✅ Client anon key present:', !!window.supabaseClient.supabaseKey);
    } catch (error) {
        console.error('❌ Error creating Supabase client:', error);
        throw error;
    }
})();

// NO crear alias local 'const supabase' para evitar conflictos con el CDN
// Usar window.supabaseClient directamente en todo el código
if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    throw new Error('Supabase client not available');
}

// NO crear alias 'const supabase' - usar window.supabaseClient directamente
// Esto evita conflictos con el CDN que puede declarar 'supabase' globalmente

// Auth helpers
const auth = {
    // Sign in with email and password
    async signIn(email, password) {
        try {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error signing in:', error);
            return { success: false, error: error.message };
        }
    },

    // Sign out
    async signOut() {
        try {
            const { error } = await window.supabaseClient.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error signing out:', error);
            return { success: false, error: error.message };
        }
    },

    // Get current session
    async getSession() {
        try {
            const { data: { session }, error } = await window.supabaseClient.auth.getSession();
            if (error) throw error;
            return session;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    },

    // Check if user is admin
    async isAdmin() {
        try {
            const session = await this.getSession();
            if (!session) return false;

            const userEmail = session.user.email;
            const { data, error } = await window.supabaseClient
                .from('admins')
                .select('email')
                .eq('email', userEmail)
                .single();

            return !error && data;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }
};

// Database helpers
const db = {
    // Get all approved events
    async getApprovedEvents() {
        try {
            const { data, error } = await window.supabaseClient
                .from('events')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching events:', error);
            return { success: false, error: error.message };
        }
    },

    // Get pending events (admin only)
    async getPendingEvents() {
        try {
            const { data, error } = await window.supabaseClient
                .from('events')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching pending events:', error);
            return { success: false, error: error.message };
        }
    },

    // Create event (user submission) usando función RPC
    async createEvent(eventData) {
        try {
            const sanitizedData = this.sanitizeEventData(eventData);
            
            if (!window.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }
            
            // Usar función RPC para evitar problemas de caché de PostgREST con políticas RLS
            const { data, error } = await window.supabaseClient
                .rpc('submit_event', {
                    p_title: sanitizedData.title,
                    p_description: sanitizedData.description,
                    p_organizer: sanitizedData.organizer,
                    p_provider: sanitizedData.provider,
                    p_audience: sanitizedData.audience,
                    p_mode: sanitizedData.mode,
                    p_date: sanitizedData.date,
                    p_date_type: sanitizedData.date_type,
                    p_month: sanitizedData.month,
                    p_year: sanitizedData.year,
                    p_time: sanitizedData.time,
                    p_location: sanitizedData.location,
                    p_info_link: sanitizedData.info_link,
                    p_register_link: sanitizedData.register_link,
                    p_image: sanitizedData.image
                });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating event:', error);
            return { success: false, error: error.message };
        }
    },

    // Update event (admin only)
    async updateEvent(id, eventData) {
        try {
            const sanitizedData = this.sanitizeEventData(eventData);
            
            const { data, error } = await window.supabaseClient
                .from('events')
                .update(sanitizedData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error updating event:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete event (admin only)
    async deleteEvent(id) {
        try {
            const { error } = await window.supabaseClient
                .from('events')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting event:', error);
            return { success: false, error: error.message };
        }
    },

    // Approve event (admin only)
    async approveEvent(id) {
        try {
            const { data, error } = await window.supabaseClient
                .from('events')
                .update({ status: 'approved' })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error approving event:', error);
            return { success: false, error: error.message };
        }
    },

    // Reject event (admin only)
    async rejectEvent(id) {
        try {
            const { error } = await window.supabaseClient
                .from('events')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error rejecting event:', error);
            return { success: false, error: error.message };
        }
    },

    // Sanitize event data to prevent XSS and injection
    sanitizeEventData(data) {
        const sanitize = (str) => {
            if (typeof str !== 'string') return str;
            return str
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
        };

        return {
            title: sanitize(data.title),
            description: sanitize(data.description),
            organizer: sanitize(data.organizer),
            provider: data.provider ? sanitize(data.provider) : null,
            audience: data.audience,
            mode: data.mode,
            // Mantener la fecha como string exacto sin conversión de zona horaria
            date: data.date ? String(data.date) : null,
            date_type: data.date_type || 'exact', // 'exact', 'month', 'pending'
            month: data.month || null,
            year: data.year || null,
            time: data.time || null,
            location: data.location ? sanitize(data.location) : null,
            info_link: data.info_link || null,
            register_link: data.register_link || null,
            image: data.image || '/public/fondo_por_defecto_en_eventos_sin_imagen.jpg',
            status: 'pending' // Always pending for user submissions
        };
    }
};

// Storage helpers (Supabase Storage)
// Bucket esperado: "event-images"
const storage = {
    bucket: 'event-images',

    async uploadImage(file, folder = 'pending') {
        try {
            if (!file) throw new Error('No se proporcionó archivo');

            const ext = (file.name.split('.').pop() || '').toLowerCase();
            const safeExt = (ext === 'jpg') ? 'jpg' : (ext === 'jpeg') ? 'jpeg' : (ext === 'png') ? 'png' : '';
            if (!safeExt) throw new Error('Formato de archivo no permitido');

            const rand = Math.random().toString(36).slice(2, 10);
            const safeFolder = (folder === 'approved') ? 'approved' : 'pending';
            const path = `${safeFolder}/${Date.now()}-${rand}.${safeExt}`;

            const { error } = await window.supabaseClient.storage
                .from(this.bucket)
                .upload(path, file, {
                    cacheControl: '31536000',
                    upsert: false,
                    contentType: file.type
                });

            if (error) throw error;

            const { data } = window.supabaseClient.storage.from(this.bucket).getPublicUrl(path);
            const publicUrl = data?.publicUrl;
            if (!publicUrl) throw new Error('No se pudo obtener URL pública de la imagen');

            return { success: true, publicUrl, path };
        } catch (error) {
            console.error('Error uploading image:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Sube una imagen al bucket event-images con prefijo pending/
     * Devuelve { success, publicUrl, path, error }
     */
    async uploadPendingEventImage(file) {
        return await this.uploadImage(file, 'pending');
    },

    /**
     * Borra una imagen por URL pública (solo si pertenece al bucket y prefijo esperado).
     * Requiere permisos (admins).
     */
    async deleteByPublicUrl(publicUrl) {
        try {
            if (!publicUrl) return { success: true };

            // Solo intentar borrar si es del bucket event-images
            // Formato típico: https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
            const marker = `/storage/v1/object/public/${this.bucket}/`;
            const idx = publicUrl.indexOf(marker);
            if (idx === -1) return { success: true };

            const path = publicUrl.slice(idx + marker.length);
            if (!path) return { success: true };

            const { error } = await window.supabaseClient.storage.from(this.bucket).remove([path]);
            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Error deleting image:', error);
            return { success: false, error: error.message };
        }
    }
};

// Exponer helpers globalmente para que estén disponibles en otros scripts
window.techeventsStorage = storage;
window.auth = auth;
window.db = db;