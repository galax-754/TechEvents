-- FIX DEFINITIVO: Eliminar TODAS las políticas y crear una política permisiva simple
-- Este script resuelve el error 42501 de forma definitiva
--
-- IMPORTANTE: Ejecuta este script COMPLETO en Supabase SQL Editor

-- PASO 1: Deshabilitar RLS temporalmente para limpieza completa
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar TODAS las políticas existentes (sin importar cómo se llamen)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'events' AND cmd = 'INSERT'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON events', pol.policyname);
        RAISE NOTICE 'Eliminada política: %', pol.policyname;
    END LOOP;
END $$;

-- PASO 3: Rehabilitar RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- PASO 4: Crear una política MUY SIMPLE y permisiva (temporal para debugging)
CREATE POLICY "Public can submit events"
ON events FOR INSERT
TO anon, authenticated
WITH CHECK (true);  -- Permitir TODO temporalmente

-- PASO 5: Verificar que se creó correctamente
SELECT 
    policyname,
    cmd as operation,
    roles,
    with_check as check_condition
FROM pg_policies 
WHERE tablename = 'events' AND cmd = 'INSERT';

-- PASO 6: Verificar permisos GRANT
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
  AND table_name = 'events'
  AND grantee IN ('anon', 'authenticated')
  AND privilege_type = 'INSERT'
ORDER BY grantee;

-- PASO 7: Verificar que RLS está habilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'events';

-- NOTA: Después de verificar que funciona, ejecuta restore-rls-check.sql
-- para restaurar la verificación de status = 'pending'
