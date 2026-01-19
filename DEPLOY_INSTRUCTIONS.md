# 🚀 Instrucciones para Desplegar TechEvents

## ✅ Lo que se ha completado:

1. ✅ **Sistema de Login para Admin** - `login.html`
2. ✅ **Conexión a Supabase** - `config/supabase.js`
3. ✅ **CRUD completo** - Crear, editar, eliminar eventos
4. ✅ **Lista de espera** - Usuarios envían eventos que van a "pending"
5. ✅ **Fechas flexibles** - Exacta, solo mes, o pendiente
6. ✅ **Seguridad implementada** - RLS, sanitización, validaciones
7. ✅ **Repositorio GitHub** creado

## 📝 Pasos para completar el deploy:

### 1. Subir archivos a GitHub

```bash
cd D:\Escritorio1\Entrenamiento\TechEvents

# Inicializar Git
git init
git branch -M main

# Agregar remote
git remote add origin https://github.com/galax-754/TechEvents.git

# Agregar todos los archivos
git add .

# Commit
git commit -m "Initial commit: TechEvents Platform with Supabase, Auth & CRUD"

# Push
git push -u origin main
```

### 2. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. Ve a **SQL Editor** y ejecuta todo el contenido de `config/schema.sql`
3. **IMPORTANTE**: Actualiza el email del admin en la última línea:
   ```sql
   INSERT INTO admins (email) VALUES ('tu-email@example.com');
   ```
4. Ve a **Settings > API** y copia:
   - Project URL
   - anon public key

5. Actualiza `config/supabase.js` con tus credenciales:
   ```javascript
   const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
   const SUPABASE_ANON_KEY = 'tu-anon-key-aqui';
   ```

### 3. Crear usuario admin

1. En Supabase, ve a **Authentication > Users**
2. Click en **"Add user"** > **"Create new user"**
3. Email: El mismo que pusiste en la tabla `admins`
4. Password: Una contraseña segura
5. Click **"Create user"**

### 4. Desplegar en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd D:\Escritorio1\Entrenamiento\TechEvents
vercel
```

O manualmente:
1. Ve a [vercel.com](https://vercel.com)
2. Click en **"Add New..."** > **"Project"**
3. Importa tu repositorio de GitHub
4. Click en **"Deploy"**

### 5. Probar la aplicación

1. **Como usuario**:
   - Ve a tu sitio desplegado
   - Navega por los eventos
   - Envía un nuevo evento desde "Publicar Evento"

2. **Como admin**:
   - Click en "Admin" en la navegación
   - Inicia sesión con el usuario que creaste en Supabase
   - Verás las solicitudes pendientes
   - Aprueba, edita o rechaza eventos

## 🔒 Seguridad - IMPORTANTE

### Antes de hacer público:

1. **NO subas tus credenciales de Supabase al código**
   - Ya están en `config/supabase.js` pero son las públicas (anon key)
   - NUNCA subas la `service_role` key

2. **Configura dominios permitidos en Supabase**:
   - Settings > API > Site URL
   - Agrega: `https://tu-dominio.vercel.app`

3. **Habilita Email Confirmation** (opcional):
   - Authentication > Settings
   - Enable "Confirm email"

4. **Rate Limiting** (recomendado):
   - En producción, configura rate limiting en Supabase

## 📊 Estructura de la Base de Datos

Ya está creada con `schema.sql`. Incluye:

- **Tabla `events`**: Todos los eventos
  - Campos para fechas flexibles (exact, month, pending)
  - RLS policies
  - Validaciones

- **Tabla `admins`**: Emails de administradores
  - RLS para proteger acceso

## 🎨 Características Implementadas

### Para Usuarios:
- ✅ Ver eventos aprobados
- ✅ Filtrar por modo, audiencia, fecha
- ✅ Modal con detalles completos
- ✅ Formulario de solicitud con validación
- ✅ 3 tipos de fecha: exacta, mes, pendiente

### Para Admins:
- ✅ Login seguro con Supabase Auth
- ✅ Panel con 2 tabs: Pending / Approved
- ✅ Aprobar/Rechazar eventos
- ✅ Editar eventos (todos los campos)
- ✅ Eliminar eventos
- ✅ Cerrar sesión

## 🛡️ Seguridad Implementada

1. **Row Level Security (RLS)**:
   - Usuarios solo ven eventos aprobados
   - Solo admins pueden modificar

2. **Sanitización de inputs**:
   - Función `db.sanitizeEventData()`
   - Prevención de XSS

3. **Validaciones**:
   - Cliente: JavaScript
   - Servidor: SQL constraints
   - RLS: Políticas de seguridad

4. **Autenticación**:
   - Solo emails en tabla `admins` pueden acceder
   - Verificación doble: auth + admin table

## 📱 URLs Importantes

- **Sitio principal**: `https://tu-dominio.vercel.app`
- **Admin login**: `https://tu-dominio.vercel.app/login.html`
- **Admin panel**: `https://tu-dominio.vercel.app/admin.html`

## 🐛 Troubleshooting

### "Error al cargar eventos"
- Verifica que las credenciales de Supabase sean correctas
- Revisa que las tablas estén creadas
- Verifica las RLS policies

### "No tienes permisos de administrador"
- Asegúrate que el email esté en la tabla `admins`
- Verifica que el usuario esté creado en Supabase Auth

### "Cannot read property..."
- Verifica que Supabase JS esté cargado
- Revisa la consola del navegador para más detalles

## 📞 Soporte

Si encuentras algún problema:
1. Revisa la consola del navegador (F12)
2. Verifica los logs en Supabase
3. Revisa `SECURITY.md` para más detalles

## 🎉 ¡Listo!

Tu plataforma TechEvents está completa y lista para producción. 

**Siguiente paso**: `git push` y luego deploy en Vercel.

---

**Desarrollado con ❤️ para la comunidad FCFM**