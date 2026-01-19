-- Crear/registrar un administrador para TechEvents
-- Este script registra el email como administrador en la tabla public.admins
-- IMPORTANTE: También debes crear el usuario en Supabase Auth (ver CREDENCIALES_ADMIN.md)

-- Email del administrador
INSERT INTO public.admins (email)
VALUES ('kareny.garzaesp@uanl.edu.mx')
ON CONFLICT (email) DO NOTHING;

-- Verificar que se insertó correctamente
SELECT * FROM public.admins WHERE email = 'kareny.garzaesp@uanl.edu.mx';

