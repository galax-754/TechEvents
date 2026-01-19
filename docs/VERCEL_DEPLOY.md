# 🚀 Guía de Despliegue Manual en Vercel

Esta guía te ayudará a desplegar TechEvents en Vercel paso a paso, incluso si no puedes usar comandos automatizados.

## 📋 Prerrequisitos

1. ✅ Cuenta de GitHub con el repositorio `TechEvents` subido
2. ✅ Cuenta de Vercel (gratis) - [vercel.com/signup](https://vercel.com/signup)
3. ✅ Proyecto de Supabase configurado con las tablas creadas
4. ✅ Credenciales de Supabase (URL y anon key)

---

## 🔧 Paso 1: Verificar Configuración de Supabase

### 1.1 Verificar que las tablas estén creadas

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Abre el **SQL Editor**
3. Ejecuta este query para verificar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('events', 'admins');
```

**Debes ver**: `events` y `admins` en los resultados

### 1.2 Verificar que haya eventos de prueba (opcional)

```sql
SELECT COUNT(*) as total_events FROM events WHERE status = 'approved';
```

Si el resultado es `0`, necesitas crear eventos de prueba o aprobar algunos eventos pendientes.

### 1.3 Verificar credenciales en el código

Abre `config/supabase.js` y verifica que tenga:

```javascript
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu-anon-key-aqui';
```

**⚠️ IMPORTANTE**: Estas son las claves públicas (anon key). NUNCA subas la `service_role` key.

---

## 🌐 Paso 2: Desplegar en Vercel (Método Web)

### 2.1 Conectar con GitHub

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión (o crea una cuenta si no tienes)
3. Click en **"Add New..."** > **"Project"**
4. Si es la primera vez, autoriza Vercel para acceder a tu GitHub
5. Busca el repositorio `galax-754/TechEvents`
6. Click en **"Import"**

### 2.2 Configurar el Proyecto

Vercel detectará automáticamente que es un proyecto estático. Verás:

- **Framework Preset**: `Other` (o `Vite` si lo detecta)
- **Root Directory**: `./` (debe estar vacío o con `.`)
- **Build Command**: (dejar vacío - no necesitamos build)
- **Output Directory**: (dejar vacío - archivos estáticos)

**NO cambies nada**, solo haz click en **"Deploy"**

### 2.3 Esperar el Despliegue

- Vercel construirá y desplegará tu proyecto
- Verás un log en tiempo real
- Cuando termine, verás: **"Ready"** con una URL tipo: `https://techevents-xxxxx.vercel.app`

### 2.4 Verificar el Despliegue

1. Click en la URL que te dio Vercel
2. Deberías ver la página principal de TechEvents
3. Abre la consola del navegador (F12) y verifica que no haya errores

---

## 🔍 Paso 3: Diagnosticar Problemas Comunes

### Problema: "Cargando eventos..." pero no aparecen eventos

**Causas posibles:**

1. **No hay eventos aprobados en la base de datos**
   - Solución: Ve a Supabase > SQL Editor y ejecuta:
   ```sql
   -- Ver eventos pendientes
   SELECT * FROM events WHERE status = 'pending';
   
   -- Aprobar un evento (cambia el ID)
   UPDATE events SET status = 'approved' WHERE id = 1;
   ```

2. **Error en las credenciales de Supabase**
   - Solución: Verifica `config/supabase.js` tiene las credenciales correctas
   - Verifica en la consola del navegador (F12) si hay errores de conexión

3. **Problema con Row Level Security (RLS)**
   - Solución: Ve a Supabase > SQL Editor y ejecuta:
   ```sql
   -- Verificar políticas RLS
   SELECT * FROM pg_policies WHERE tablename = 'events';
   
   -- Si no hay políticas, ejecuta el schema.sql completo
   ```

4. **Rutas de imágenes incorrectas**
   - Solución: Las imágenes deben estar en `/public/` y las rutas deben empezar con `/`
   - Verifica que las imágenes estén en la carpeta `public/` del proyecto

### Problema: "Error al cargar eventos" con mensaje de error

**Pasos para diagnosticar:**

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Console**
3. Busca errores en rojo
4. Los errores comunes son:

   - `Failed to fetch`: Problema de conexión con Supabase
     - Verifica que la URL de Supabase sea correcta
     - Verifica que no haya bloqueadores de CORS
   
   - `relation "events" does not exist`: La tabla no existe
     - Ejecuta `config/schema.sql` completo en Supabase
   
   - `new row violates row-level security policy`: Problema con RLS
     - Verifica que las políticas RLS estén creadas correctamente
     - Ejecuta el schema.sql completo de nuevo

### Problema: Las imágenes no se muestran

**Causas:**

1. **Rutas incorrectas**: Las imágenes deben tener rutas absolutas desde la raíz
   - Correcto: `/public/imagen.jpg`
   - Incorrecto: `public/imagen.jpg` o `./public/imagen.jpg`

2. **Imágenes no subidas a GitHub**
   - Verifica que las imágenes estén en la carpeta `public/`
   - Verifica que estén en el repositorio de GitHub

3. **Cache del navegador**
   - Presiona `Ctrl + Shift + R` (o `Cmd + Shift + R` en Mac) para refrescar sin cache

---

## 🔄 Paso 4: Actualizar Despliegue Después de Cambios

### Método 1: Push a GitHub (Automático)

1. Haz cambios en tu código local
2. Commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push origin main
   ```
3. Vercel detectará automáticamente el cambio
4. Irá a tu dashboard de Vercel y verás un nuevo deployment
5. Espera a que termine (generalmente 1-2 minutos)

### Método 2: Redeploy Manual desde Vercel

1. Ve a tu proyecto en Vercel
2. Click en **"Deployments"**
3. Click en los tres puntos (`...`) del último deployment
4. Click en **"Redeploy"**
5. Confirma el redeploy

---

## 🔐 Paso 5: Configurar Dominio Personalizado (Opcional)

1. Ve a tu proyecto en Vercel
2. Click en **"Settings"** > **"Domains"**
3. Agrega tu dominio (ej: `techevents.tudominio.com`)
4. Sigue las instrucciones de Vercel para configurar DNS
5. Espera a que se verifique (puede tardar hasta 24 horas)

---

## 🛠️ Paso 6: Configurar Variables de Entorno (Si es necesario)

Si en el futuro necesitas usar variables de entorno:

1. Ve a tu proyecto en Vercel
2. Click en **"Settings"** > **"Environment Variables"**
3. Agrega las variables necesarias
4. Haz un redeploy para que se apliquen

**Nota**: Actualmente TechEvents no usa variables de entorno porque las claves de Supabase están en el código (son públicas y seguras).

---

## 📊 Paso 7: Verificar que Todo Funciona

### Checklist de Verificación:

- [ ] La página principal carga correctamente
- [ ] Los eventos se muestran (o muestra "No hay eventos disponibles" si no hay)
- [ ] Los filtros funcionan
- [ ] El modal de detalles se abre al hacer click en "Ver más"
- [ ] El formulario de "Publicar Evento" funciona
- [ ] El login de admin funciona (`/login.html`)
- [ ] El panel de admin funciona (`/admin.html`)
- [ ] Las imágenes se muestran correctamente

### Probar como Usuario:

1. Navega por los eventos
2. Usa los filtros (modo, audiencia, fecha)
3. Haz click en "Ver más" en un evento
4. Envía un nuevo evento desde "Publicar Evento"

### Probar como Admin:

1. Ve a `/login.html`
2. Inicia sesión con tu cuenta de admin
3. Ve a `/admin.html`
4. Verifica que puedas ver eventos pendientes
5. Aprueba, edita o rechaza un evento

---

## 🐛 Troubleshooting Avanzado

### Ver Logs de Vercel

1. Ve a tu proyecto en Vercel
2. Click en **"Deployments"**
3. Click en un deployment específico
4. Click en **"Functions"** o **"Build Logs"** para ver detalles

### Verificar Configuración de Vercel

El archivo `vercel.json` ya está configurado con:
- Rutas para HTML, CSS, JS e imágenes
- Headers de seguridad
- Cache para imágenes

Si necesitas modificarlo, edita `vercel.json` y haz push a GitHub.

### Problema: "404 Not Found" en algunas páginas

**Solución**: Verifica que `vercel.json` tenga las rutas correctas. El archivo ya está configurado, pero si agregas nuevas páginas, agrega sus rutas.

### Problema: CORS Error

Si ves errores de CORS en la consola:

1. Ve a Supabase > Settings > API
2. En **"CORS"**, agrega tu dominio de Vercel
3. O usa `*` para desarrollo (no recomendado en producción)

---

## 📝 Notas Importantes

1. **Las claves de Supabase en el código son públicas**: La `anon key` está diseñada para ser pública. No es un problema de seguridad.

2. **RLS protege tu base de datos**: Aunque las claves sean públicas, Row Level Security previene acceso no autorizado.

3. **No subas la `service_role` key**: Esta clave es privada y nunca debe estar en el código del frontend.

4. **Backups**: Vercel hace backups automáticos, pero considera hacer backups de tu base de datos de Supabase también.

5. **Límites de Vercel (Plan Gratis)**:
   - 100 GB de ancho de banda por mes
   - Deployments ilimitados
   - Sin límite de proyectos

---

## 🆘 Si Nada Funciona

1. **Revisa la consola del navegador** (F12) para errores específicos
2. **Revisa los logs de Vercel** en el dashboard
3. **Verifica que el schema.sql se ejecutó completo** en Supabase
4. **Verifica las credenciales** en `config/supabase.js`
5. **Prueba en modo incógnito** para descartar problemas de cache

---

## ✅ Resumen Rápido

1. ✅ Sube código a GitHub
2. ✅ Conecta Vercel con GitHub
3. ✅ Importa el proyecto
4. ✅ Click en "Deploy"
5. ✅ Verifica que funcione
6. ✅ Configura Supabase (si no lo has hecho)
7. ✅ Crea eventos de prueba o aprueba eventos pendientes

---

**¿Necesitas ayuda?** Revisa:
- `DEPLOY_INSTRUCTIONS.md` - Instrucciones generales
- `SECURITY.md` - Información de seguridad
- `README.md` - Documentación del proyecto

---

**¡Tu aplicación debería estar funcionando ahora!** 🎉
