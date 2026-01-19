-- ============================================================================
-- SOLUCIÓN ALTERNATIVA: Función RPC para crear eventos
-- ============================================================================
-- Esta función evita el caché de PostgREST usando una función de PostgreSQL
-- Las funciones RPC no pasan por las políticas RLS de la misma manera
-- ============================================================================

-- PASO 1: Crear función para insertar eventos públicos
CREATE OR REPLACE FUNCTION public.submit_event(
    p_title TEXT,
    p_description TEXT,
    p_organizer TEXT,
    p_provider TEXT DEFAULT NULL,
    p_audience TEXT DEFAULT 'todos',
    p_mode TEXT DEFAULT 'virtual',
    p_date DATE DEFAULT NULL,
    p_date_type TEXT DEFAULT 'pending',
    p_month INTEGER DEFAULT NULL,
    p_year INTEGER DEFAULT NULL,
    p_time TIME DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_info_link TEXT DEFAULT NULL,
    p_register_link TEXT DEFAULT NULL,
    p_image TEXT DEFAULT '/public/fondo_por_defecto_en_eventos_sin_imagen.jpg'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER  -- Ejecuta con permisos del owner (evita RLS)
SET search_path = public
AS $$
DECLARE
    new_event json;
BEGIN
    -- Insertar el evento directamente con status = 'pending'
    INSERT INTO events (
        title,
        description,
        organizer,
        provider,
        audience,
        mode,
        date,
        date_type,
        month,
        year,
        time,
        location,
        info_link,
        register_link,
        image,
        status
    ) VALUES (
        p_title,
        p_description,
        p_organizer,
        p_provider,
        p_audience,
        p_mode,
        p_date,
        p_date_type,
        p_month,
        p_year,
        p_time,
        p_location,
        p_info_link,
        p_register_link,
        p_image,
        'pending'
    )
    RETURNING row_to_json(events.*) INTO new_event;
    
    RETURN new_event;
END;
$$;

-- PASO 2: Otorgar permisos de ejecución a anon y authenticated
GRANT EXECUTE ON FUNCTION public.submit_event TO anon;
GRANT EXECUTE ON FUNCTION public.submit_event TO authenticated;

-- PASO 3: Verificar que la función se creó correctamente
SELECT 
    'Function Created' as status,
    proname as "Function Name",
    prosecdef as "Security Definer"
FROM pg_proc
WHERE proname = 'submit_event';
