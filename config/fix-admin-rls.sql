-- FIX: Corregir política RLS circular de la tabla admins
-- Este script corrige el problema donde no se puede verificar si un usuario es admin
-- porque la política RLS requiere ser admin para leer la tabla admins (problema circular)

-- Eliminar la política antigua (circular)
DROP POLICY IF EXISTS "Admins can view admins table" ON admins;

-- Crear nueva política que permite a usuarios autenticados verificar su propio email
-- Esto permite que isAdmin() funcione correctamente
CREATE POLICY "Authenticated users can check own admin status"
ON admins FOR SELECT
TO authenticated
USING (
    auth.email() = email
);

-- Verificar que la política se creó correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'admins';
