// Supabase Configuration
// IMPORTANT: These are PUBLIC keys that can be exposed in the frontend
// Never commit your service_role key to GitHub

const SUPABASE_URL = 'https://rzaiebqdmewhbjpmvtha.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6YWllYnFkbWV3aGJqcG12dGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDU2MDQsImV4cCI6MjA4NDI4MTYwNH0.21PgG8moJdsZpB-pWHX77MMUCzOv8O4JEiNUq_1g3fo';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helpers
const auth = {
    // Sign in with email and password
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
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
            const { error } = await supabase.auth.signOut();
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
            const { data: { session }, error } = await supabase.auth.getSession();
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

            const { data, error } = await supabase
                .from('admins')
                .select('email')
                .eq('email', session.user.email)
                .single();

            return !error && data;
        } catch (error) {
            return false;
        }
    }
};

// Database helpers
const db = {
    // Get all approved events
    async getApprovedEvents() {
        try {
            const { data, error } = await supabase
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
            const { data, error } = await supabase
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

    // Create event (user submission)
    async createEvent(eventData) {
        try {
            // Sanitize input
            const sanitizedData = this.sanitizeEventData(eventData);
            
            const { data, error } = await supabase
                .from('events')
                .insert([sanitizedData])
                .select()
                .single();

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
            
            const { data, error } = await supabase
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
            const { error } = await supabase
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
            const { data, error } = await supabase
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
            const { error } = await supabase
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
            date: data.date || null,
            date_type: data.date_type || 'exact', // 'exact', 'month', 'pending'
            month: data.month || null,
            year: data.year || null,
            time: data.time || null,
            location: data.location ? sanitize(data.location) : null,
            info_link: data.info_link || null,
            register_link: data.register_link || null,
            image: data.image || 'public/fondo_por_defecto_en_eventos_sin_imagen.jpg',
            status: 'pending' // Always pending for user submissions
        };
    }
};