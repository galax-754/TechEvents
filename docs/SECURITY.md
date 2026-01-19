# TechEvents - Configuración de Seguridad

## Variables de Entorno

Este proyecto es estático (HTML/CSS/JS) y se conecta a Supabase desde el navegador usando la **anon key**.
Esa key es pública por diseño, pero tu seguridad depende de:
- **Row Level Security (RLS)** correctamente configurado
- Políticas de **Storage** correctamente configuradas

Si quieres parametrizar credenciales para desarrollo local, puedes usar `.env`, pero en producción (Vercel estático)
se suelen dejar en `config/supabase.js` porque no hay backend.

## Configuración de Supabase

1. Ve a `config/supabase.js` y actualiza:
   - `SUPABASE_URL` con tu URL de Supabase
   - `SUPABASE_ANON_KEY` con tu clave anon pública

2. En Supabase, ejecuta el SQL en `config/schema.sql`

3. Actualiza el email del admin en la última línea del SQL

## Row Level Security (RLS)

Las políticas RLS están configuradas para:

- **Usuarios públicos**: Solo pueden ver eventos aprobados
- **Usuarios públicos**: Pueden enviar eventos (van a pending) (ver política `Public can submit events`)
- **Administradores**: Pueden ver, editar y eliminar todos los eventos

## Supabase Storage (Imágenes)

Las imágenes se suben al bucket `event-images` (Supabase Storage).

- **Lectura pública**: permitida para servir imágenes en el frontend
- **Subida**: permitida para `anon` y `authenticated` SOLO al prefijo `pending/`
- **Administradores**: pueden gestionar imágenes (upload/update/delete) mediante la política de admins

Script de políticas: `config/storage-policies.sql`

## Protección XSS

El proyecto incluye:
- Sanitización de inputs en `db.sanitizeEventData()`
- Validación en cliente y servidor
- Escape de HTML en outputs

## CORS y Headers de Seguridad

Para producción, agrega estos headers en Vercel:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## Autenticación

- Solo administradores pueden acceder a `/admin.html`
- El login verifica credenciales Y que el email esté en la tabla `admins`
- Las sesiones expiran automáticamente (configurado en Supabase)

## Rate Limiting

Se implementó un rate limit básico en frontend (best-effort, por navegador):
- Envío de eventos: 5 por hora, 10 por día
- Login admin: 10 intentos por hora

Recomendación: si quieres protección real contra abuso, implementa Edge Function / backend para validar y
rate-limitar por IP/usuario.

## Validaciones

Todas las validaciones se realizan en:
1. Cliente (JavaScript)
2. Base de datos (Constraints SQL)
3. Row Level Security (Políticas)

## Backups

Configura backups automáticos en Supabase (Settings > Database)