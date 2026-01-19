# TechEvents - Plataforma de Eventos Tecnológicos

🚀 Plataforma moderna para descubrir y publicar eventos tecnológicos, hackathones y competencias de programación.

## 📸 Características

- ✨ Diseño moderno con glassmorphism
- 🔐 Sistema de autenticación para administradores
- 📱 Completamente responsive
- 🎨 Interfaz elegante y profesional
- 🔒 Seguridad con Row Level Security (RLS)
- ⚡ Base de datos en tiempo real con Supabase
- 📅 Manejo flexible de fechas (exacta, mes, o pendiente)

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Hosting**: Vercel
- **Autenticación**: Supabase Auth

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/TechEvents.git
cd TechEvents
```

### 2. Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > API y copia:
   - `Project URL`
   - `anon public key`

### 3. Configurar el proyecto

Edita `config/supabase.js` y actualiza:

```javascript
const SUPABASE_URL = 'tu_supabase_url_aqui';
const SUPABASE_ANON_KEY = 'tu_supabase_anon_key_aqui';
```

### 4. Crear las tablas en Supabase

1. Ve a SQL Editor en Supabase
2. Copia y ejecuta todo el contenido de `config/schema.sql`
3. **IMPORTANTE**: Actualiza la última línea con tu email de admin:

```sql
INSERT INTO admins (email) VALUES ('tu-email@example.com');
```

### 5. Crear usuario admin

1. Ve a Authentication > Users en Supabase
2. Crea un nuevo usuario con el mismo email que agregaste a la tabla `admins`
3. Usa este usuario para el login de admin

### 6. Desplegar en Vercel

Consulta la guía completa en [`docs/DEPLOY_VERCEL.md`](docs/DEPLOY_VERCEL.md) para instrucciones detalladas de deploy.

**Resumen rápido:**
1. Sube tu código a GitHub
2. Conecta tu repositorio a Vercel
3. Vercel detectará automáticamente la configuración
4. ¡Listo! Tu sitio estará en línea

## 📖 Uso

### Para Usuarios

1. **Ver Eventos**: Navega por los eventos aprobados en la página principal
2. **Filtrar**: Usa los filtros por modo, audiencia y fecha
3. **Publicar Evento**: 
   - Ve a la sección "Publicar Evento"
   - Completa el formulario
   - Selecciona el tipo de fecha:
     * **Tengo la fecha exacta**: Día, mes, año y hora
     * **Tengo el mes pero no el día**: Solo mes y año
     * **Aún no tengo la fecha**: El evento estará marcado como "Próximamente"
   - Tu evento entrará en lista de espera para revisión

### Para Administradores

1. **Login**: Click en "Admin" → Iniciar sesión
2. **Revisar Solicitudes**: 
   - Pestaña "Solicitudes Pendientes"
   - Aprobar o rechazar eventos
   - Editar antes de aprobar
3. **Gestionar Eventos**:
   - Pestaña "Eventos Publicados"
   - Editar o eliminar eventos

## 🔒 Seguridad

El proyecto implementa múltiples capas de seguridad:

- **RLS (Row Level Security)**: Políticas a nivel de base de datos
- **Sanitización de inputs**: Prevención de XSS
- **Validaciones**: En cliente y servidor
- **Autenticación**: Solo admins autorizados
- **HTTPS**: Forzado en producción

Ver `docs/SECURITY.md` para más detalles.

## 📁 Estructura del Proyecto

```
TechEvents/
├── config/
│   ├── supabase.js        # Configuración y helpers de Supabase
│   ├── schema.sql         # Schema de la base de datos
│   └── *.sql              # Scripts SQL adicionales
├── css/
│   ├── styles.css         # Estilos principales
│   └── admin.css          # Estilos del panel admin
├── js/
│   ├── app.js             # Lógica principal
│   └── admin.js           # Lógica del admin panel
├── docs/
│   ├── DEPLOY_VERCEL.md   # Guía de deploy en Vercel
│   ├── SECURITY.md        # Documentación de seguridad
│   └── *.md               # Otra documentación
├── public/
│   └── [imágenes]         # Imágenes de eventos
├── index.html             # Página principal
├── login.html             # Login de admin
├── admin.html             # Panel de administración
├── vercel.json            # Configuración de Vercel
├── README.md              # Este archivo
└── .gitignore             # Archivos ignorados por Git
```

## 🎯 Funcionalidades

### Usuarios
- ✅ Ver eventos aprobados
- ✅ Filtrar por modo, audiencia, fecha
- ✅ Ver detalles completos de eventos
- ✅ Enviar solicitudes de eventos
- ✅ Fechas flexibles (exacta/mes/pendiente)

### Administradores
- ✅ Login seguro
- ✅ Ver solicitudes pendientes
- ✅ Aprobar/Rechazar eventos
- ✅ Editar eventos
- ✅ Eliminar eventos
- ✅ CRUD completo

## 🔧 Variables de Entorno

Crea un archivo `.env` (NO subir a GitHub):

```
SUPABASE_URL=tu_url_aqui
SUPABASE_ANON_KEY=tu_key_aqui
```

## 🚦 Estado del Proyecto

- ✅ Frontend completo
- ✅ Backend con Supabase
- ✅ Autenticación
- ✅ CRUD de eventos
- ✅ Seguridad implementada
- ✅ Listo para producción

## 📝 Próximas Mejoras

- [ ] Subida de imágenes de eventos
- [ ] Notificaciones por email
- [ ] Sistema de comentarios
- [ ] Integración con Google Calendar
- [ ] PWA (Progressive Web App)
- [ ] Dark/Light mode toggle

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

Desarrollado para la comunidad FCFM - UANL

## 📧 Soporte

Para reportar bugs o solicitar features, abre un issue en GitHub.

---

**⚡ ¡Descubre los mejores eventos tecnológicos! 🚀**