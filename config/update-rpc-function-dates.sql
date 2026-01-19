-- ============================================================================
-- ACTUALIZAR FUNCIÓN RPC: Fix para manejo correcto de fechas
-- ============================================================================
-- Este script actualiza la función submit_event para evitar problemas
-- de conversión de zona horaria en las fechas
-- ============================================================================

-- Eliminar la función anterior
DROP FUNCTION IF EXISTS public.submit_event(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, TIME, TEXT, TEXT, TEXT, TEXT);

-- Recrear la función con el tipo correcto para p_date (TEXT en lugar de DATE)
CREATE OR REPLACE FUNCTION public.submit_event(
    p_title TEXT,
    p_description TEXT,
    p_organizer TEXT,
    p_provider TEXT DEFAULT NULL,
    p_audience TEXT DEFAULT 'todos',
    p_mode TEXT DEFAULT 'virtual',
    p_date TEXT DEFAULT NULL,  -- Cambiado a TEXT para control preciso
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
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_event json;
    date_value DATE;
BEGIN
    -- Convertir la fecha de TEXT a DATE sin conversión de zona horaria
    date_value := CASE 
        WHEN p_date IS NOT NULL AND p_date != '' THEN p_date::DATE 
        ELSE NULL 
    END;
    
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
        date_value,
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

-- Verificar que se actualizó correctamente
SELECT 'Función RPC actualizada correctamente' as status;
