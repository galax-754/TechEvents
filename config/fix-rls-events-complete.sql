-- FIX COMPLETO: Verificar y corregir políticas RLS para permitir inserción de eventos
-- Este script corrige el error: "new row violates row-level security policy for table 'events'"
-- 
-- IMPORTANTE: Ejecuta este script COMPLETO en Supabase SQL Editor

-- Paso 1: Verificar que RLS esté habilitado
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Paso 2: Eliminar TODAS las políticas de INSERT existentes (por si hay conflictos)
DROP POLICY IF EXISTS "Public can submit events" ON events;
DROP POLICY IF EXISTS "Authenticated users can submit events" ON events;
DROP POLICY IF EXISTS "anon can insert events" ON events;

-- Paso 3: Crear la política correcta para INSERT
-- Esta política permite que usuarios anónimos (anon) y autenticados inserten eventos
-- PERO SOLO si el status es 'pending'
CREATE POLICY "Public can submit events"
ON events FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');

-- Paso 4: Verificar que la política se creó correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    with_check as check_condition
FROM pg_policies 
WHERE tablename = 'events' AND cmd = 'INSERT';

-- Paso 5: Verificar que RLS está habilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'events';

-- Paso 6: Listar TODAS las políticas de la tabla events (para debugging)
SELECT 
    policyname,
    cmd as operation,
    roles,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies 
WHERE tablename = 'events'
ORDER BY cmd, policyname;

-- Paso 7: Prueba manual (opcional - comenta si quieres ejecutarlo)
-- Esto simula lo que hace el frontend y debería funcionar ahora
/*
INSERT INTO events (
    title,
    description,
    organizer,
    audience,
    mode,
    date_type,
    status,
    image
) VALUES (
    'Test Event',
    'This is a test event to verify RLS policies',
    'Test Organizer',
    'todos',
    'virtual',
    'pending',
    'pending',
    '/public/fondo_por_defecto_en_eventos_sin_imagen.jpg'
);

-- Si la inserción funcionó, deberías ver el evento:
SELECT id, title, status FROM events WHERE title = 'Test Event';

-- Limpiar el test:
DELETE FROM events WHERE title = 'Test Event';
*/
