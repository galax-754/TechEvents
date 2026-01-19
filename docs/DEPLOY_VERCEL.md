# 🚀 Guía Completa: Commit a GitHub y Deploy en Vercel

Esta guía te llevará paso a paso desde hacer commit de tu código hasta tenerlo desplegado en Vercel.

---

## 📋 Prerrequisitos

- ✅ Cuenta de GitHub
- ✅ Cuenta de Vercel (gratis) - [vercel.com/signup](https://vercel.com/signup)
- ✅ Proyecto de Supabase configurado
- ✅ Git instalado en tu computadora

---

## 🔧 Parte 1: Commit y Push a GitHub

### Paso 1: Verificar el estado de Git

```bash
cd D:\Escritorio1\Entrenamiento\TechEvents
git status
```

### Paso 2: Agregar todos los archivos

```bash
git add .
```

### Paso 3: Hacer commit

```bash
git commit -m "Initial commit: TechEvents platform ready for deployment"
```

O si ya tienes commits previos:

```bash
git commit -m "Organize project: move docs and remove sensitive files"
```

### Paso 4: Verificar el remote de GitHub

```bash
git remote -v
```

Si no tienes el remote configurado:

```bash
git remote add origin https://github.com/galax-754/TechEvents.git
```

### Paso 5: Push a GitHub

```bash
git push -u origin main
```

Si tienes problemas con la rama:

```bash
git branch -M main
git push -u origin main
```

**✅ Verifica en GitHub**: Ve a `https://github.com/galax-754/TechEvents` y confirma que todos los archivos estén subidos.

---

## 🌐 Parte 2: Deploy en Vercel

### Paso 1: Conectar GitHub a Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New..."** → **"Project"**
3. Selecciona **"Import Git Repository"**
4. Autoriza Vercel para acceder a tu cuenta de GitHub si es necesario
5. Busca y selecciona el repositorio **`galax-754/TechEvents`**
6. Click en **"Import"**

### Paso 2: Configurar el Proyecto

Vercel detectará automáticamente que es un proyecto estático. La configuración debería ser:

- **Framework Preset**: Other
- **Root Directory**: `./` (raíz)
- **Build Command**: (dejar vacío - no hay build)
- **Output Directory**: `./` (raíz)
- **Install Command**: (dejar vacío)

### Paso 3: Variables de Entorno (IMPORTANTE)

**NO necesitas configurar variables de entorno** porque las credenciales de Supabase están hardcodeadas en `config/supabase.js` (son claves públicas/anon que pueden estar en el frontend).

Sin embargo, si prefieres usar variables de entorno:

1. En la sección **"Environment Variables"**, agrega:
   - `SUPABASE_URL` = `https://rzaiebqdmewhbjpmvtha.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6YWllYnFkbWV3aGJqcG12dGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDU2MDQsImV4cCI6MjA4NDI4MTYwNH0.21PgG8moJdsZpB-pWHX77MMUCzOv8O4JEiNUq_1g3fo`

2. Luego necesitarías modificar `config/supabase.js` para leer de `process.env` (pero esto requiere un build step que no tienes configurado).

**Recomendación**: Deja las credenciales hardcodeadas en `config/supabase.js` ya que son claves públicas (anon key) que están diseñadas para estar en el frontend.

### Paso 4: Deploy

1. Click en **"Deploy"**
2. Espera a que termine el proceso (1-2 minutos)
3. Vercel te dará una URL como: `https://tech-events-xxxxx.vercel.app`

---

## ✅ Parte 3: Verificación Post-Deploy

### 1. Verificar que el sitio carga

- Abre la URL de Vercel en tu navegador
- Deberías ver la página principal de TechEvents

### 2. Verificar que los eventos se cargan

- La página debería mostrar eventos (si hay eventos aprobados en Supabase)
- Si no hay eventos, verás un mensaje indicando que no hay eventos

### 3. Verificar el login de admin

1. Ve a `https://tu-url.vercel.app/login.html`
2. Intenta iniciar sesión con tus credenciales de admin
3. Deberías ser redirigido a `admin.html`

### 4. Verificar rutas

- `/` → Página principal
- `/login.html` → Login de admin
- `/admin.html` → Panel de administración (requiere login)

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios y quieras actualizar el sitio:

```bash
# 1. Hacer cambios en tu código local
# 2. Commit
git add .
git commit -m "Descripción de los cambios"
# 3. Push
git push origin main
```

**Vercel detectará automáticamente el push y desplegará la nueva versión** (toma 1-2 minutos).

---

## 🐛 Solución de Problemas

### Error: "Build failed"

- Verifica que `vercel.json` esté en la raíz del proyecto
- Asegúrate de que no haya errores de sintaxis en los archivos JavaScript

### Error: "Cannot find module"

- Verifica que todos los archivos estén en GitHub
- Asegúrate de que las rutas en los HTML sean relativas (ej: `config/supabase.js` no `/config/supabase.js`)

### El sitio carga pero no muestra eventos

1. Verifica que Supabase esté configurado correctamente
2. Abre la consola del navegador (F12) y revisa errores
3. Verifica que haya eventos con `status = 'approved'` en Supabase

### El login no funciona

1. Verifica que el usuario admin esté creado en Supabase Auth
2. Verifica que el email esté en la tabla `admins`
3. Revisa la consola del navegador para errores

---

## 📝 Notas Importantes

- **Las credenciales de Supabase en `config/supabase.js` son públicas** (anon key) y están diseñadas para estar en el frontend. Esto es seguro.
- **NUNCA subas la service_role key** a GitHub o la expongas en el frontend.
- **El archivo `config/config.js` está en `.gitignore`** y no se subirá a GitHub.
- **Las credenciales del admin** (email/contraseña) NO están en el código, solo en Supabase Auth.

---

## 🎉 ¡Listo!

Tu proyecto TechEvents debería estar funcionando en Vercel. Si tienes problemas, revisa la consola del navegador y los logs de Vercel en el dashboard.
