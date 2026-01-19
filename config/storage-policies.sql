-- Supabase Storage setup for TechEvents (event images)
-- Ejecuta esto en Supabase SQL Editor DESPUÉS de crear el bucket.
--
-- 1) En Supabase Dashboard:
--    Storage -> Buckets -> New bucket
--    Name: event-images
--    Public bucket: ON (para servir imágenes por URL pública)
--
-- 2) Luego ejecuta este SQL.
--
-- Nota: con frontend público (anon key) no existe forma perfecta de evitar abuso sin backend/edge function.
-- Mitigaciones implementadas:
-- - Subidas solo al bucket "event-images"
-- - Path restringido a prefijo "pending/" para anon/auth
-- - Updates/Deletes solo para administradores autenticados

-- Asegurar RLS en storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Limpieza opcional (si re-ejecutas)
DROP POLICY IF EXISTS "Public read event-images" ON storage.objects;
DROP POLICY IF EXISTS "Anon upload pending images" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload pending images" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage images" ON storage.objects;

-- Lectura pública de imágenes del bucket event-images
CREATE POLICY "Public read event-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'event-images');

-- Subida (INSERT) para anon con prefijo pending/
CREATE POLICY "Anon upload pending images"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'event-images'
  AND (storage.foldername(name))[1] = 'pending'
);

-- Subida (INSERT) para authenticated con prefijo pending/
CREATE POLICY "Auth upload pending images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images'
  AND (storage.foldername(name))[1] = 'pending'
);

-- Admins pueden actualizar/eliminar cualquier imagen del bucket event-images
CREATE POLICY "Admins manage images"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'event-images'
  AND auth.email() IN (SELECT email FROM public.admins)
)
WITH CHECK (
  bucket_id = 'event-images'
  AND auth.email() IN (SELECT email FROM public.admins)
);

