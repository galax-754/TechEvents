-- FIX: Corregir políticas RLS para permitir inserción de eventos desde usuarios anónimos
-- Este script corrige el error: "new row violates row-level security policy for table 'events'"
-- 
-- Ejecuta este script en Supabase SQL Editor si los usuarios no pueden crear eventos

-- Primero, eliminar la política existente si existe (para recrearla)
DROP POLICY IF EXISTS "Public can submit events" ON events;

-- Crear la política que permite a usuarios anónimos insertar eventos con status='pending'
CREATE POLICY "Public can submit events"
ON events FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');

-- Verificar que la política se creó correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'events' AND policyname = 'Public can submit events';

-- También verificar que RLS está habilitado en la tabla
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'events';
