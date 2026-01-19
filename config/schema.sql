-- TechEvents Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO '/c+NQbRVb/Zs3F0P+lhev4U3yVCaBN92DSjBjsdZEf7sGean7ZVclzFzouh/AgBgGdF4Vi8DvrH3hBtnpuOCng==';

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    provider VARCHAR(255),
    audience VARCHAR(50) NOT NULL CHECK (audience IN ('estudiantes', 'profesionales', 'general', 'todos')),
    mode VARCHAR(50) NOT NULL CHECK (mode IN ('virtual', 'presencial', 'hibrido')),
    
    -- Flexible date handling
    date_type VARCHAR(20) DEFAULT 'exact' CHECK (date_type IN ('exact', 'month', 'pending')),
    date DATE,
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    year INTEGER CHECK (year >= 2024),
    time TIME,
    
    location VARCHAR(255),
    info_link TEXT,
    register_link TEXT,
    image TEXT DEFAULT '/public/fondo_por_defecto_en_eventos_sin_imagen.jpg',
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validation: If date_type is 'exact', date must be provided
    CONSTRAINT date_validation CHECK (
        (date_type = 'exact' AND date IS NOT NULL) OR
        (date_type = 'month' AND month IS NOT NULL AND year IS NOT NULL) OR
        (date_type = 'pending')
    )
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_admins_email ON admins(email);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events table

-- Anyone can read approved events
CREATE POLICY "Anyone can view approved events"
ON events FOR SELECT
USING (status = 'approved');

-- Public/Authenticated users can insert events (they go to pending)
-- Importante: el frontend usa anon key, por lo que sin esta política el formulario público NO puede enviar eventos.
CREATE POLICY "Public can submit events"
ON events FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');

-- Only admins can view pending/rejected events
CREATE POLICY "Admins can view all events"
ON events FOR SELECT
TO authenticated
USING (
    auth.email() IN (SELECT email FROM admins)
);

-- Only admins can update events
CREATE POLICY "Admins can update events"
ON events FOR UPDATE
TO authenticated
USING (
    auth.email() IN (SELECT email FROM admins)
)
WITH CHECK (
    auth.email() IN (SELECT email FROM admins)
);

-- Only admins can delete events
CREATE POLICY "Admins can delete events"
ON events FOR DELETE
TO authenticated
USING (
    auth.email() IN (SELECT email FROM admins)
);

-- RLS Policies for admins table

-- IMPORTANTE: Esta política permite que usuarios autenticados verifiquen si su propio email está en la tabla
-- Esto es necesario para la función isAdmin() que verifica permisos
-- Sin esta política, no se puede verificar si un usuario es admin (problema circular)
CREATE POLICY "Authenticated users can check own admin status"
ON admins FOR SELECT
TO authenticated
USING (
    auth.email() = email
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert your admin email (CHANGE THIS!)
INSERT INTO admins (email) VALUES ('your-admin-email@example.com')
ON CONFLICT (email) DO NOTHING;

-- Sample data (optional - remove in production)
INSERT INTO events (
    title,
    description,
    organizer,
    provider,
    audience,
    mode,
    date_type,
    status,
    image
) VALUES 
(
    'DSC DATATHON 2026',
    'Competencia de ciencia de datos organizada por el Data Science Club at Tec.',
    'Data Science Club at Tec',
    'Alicia Josefina de la Garza Montelongo',
    'estudiantes',
    'hibrido',
    'pending',
    'approved',
    '/public/fondo_por_defecto_en_eventos_sin_imagen.jpg'
),
(
    'Datathon',
    'Evento intensivo de análisis de datos donde equipos compiten resolviendo problemas reales.',
    'Laurie Hernández',
    'Mariana Garza Cedillo',
    'estudiantes',
    'presencial',
    'pending',
    'approved',
    '/public/DataThon_imagenPortada.jpg'
);

-- Verify setup
SELECT 'Events table created' as status;
SELECT 'Admins table created' as status;
SELECT 'RLS policies enabled' as status;
SELECT 'Sample data inserted' as status;