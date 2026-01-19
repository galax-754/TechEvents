# TechEvents - Configuración de Seguridad

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```
SUPABASE_URL=tu_supabase_url_aqui
SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
```

**NUNCA** subas este archivo a GitHub.

## Configuración de Supabase

1. Ve a `config/supabase.js` y actualiza:
   - `SUPABASE_URL` con tu URL de Supabase
   - `SUPABASE_ANON_KEY` con tu clave anon pública

2. En Supabase, ejecuta el SQL en `config/schema.sql`

3. Actualiza el email del admin en la última línea del SQL

## Row Level Security (RLS)

Las políticas RLS están configuradas para:

- **Usuarios públicos**: Solo pueden ver eventos aprobados
- **Usuarios autenticados**: Pueden enviar eventos (van a pending)
- **Administradores**: Pueden ver, editar y eliminar todos los eventos

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

Considera implementar rate limiting en Supabase para:
- Envío de eventos: 5 por hora por IP
- Login: 10 intentos por hora

## Validaciones

Todas las validaciones se realizan en:
1. Cliente (JavaScript)
2. Base de datos (Constraints SQL)
3. Row Level Security (Políticas)

## Backups

Configura backups automáticos en Supabase (Settings > Database)