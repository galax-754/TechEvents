# 🔍 Guía Completa de Diagnóstico - TechEvents

Esta guía te ayudará a diagnosticar y resolver el error **"Error de configuración - No se pudo conectar con la base de datos"**.

---

## 🚨 Síntoma: "Error de configuración"

Si ves este mensaje, significa que el objeto `db` no está disponible cuando se intenta cargar los eventos. Esto puede deberse a varios problemas.

---

## 📋 Checklist de Diagnóstico (Sigue en Orden)

### ✅ Paso 1: Verificar que Supabase se está cargando

**Abre la consola del navegador (F12) y busca:**

1. **Mensajes de éxito:**
   - `✅ Supabase library loaded successfully`
   - `✅ Supabase client initialized successfully`

2. **Mensajes de error:**
   - `❌ Supabase library failed to load from CDN`
   - `❌ Error initializing Supabase: ...`
   - `Error: Supabase library not loaded`

**Si ves errores aquí:**

#### Solución 1.1: Verificar conexión a internet
- El CDN de Supabase necesita internet para cargar
- Verifica que no haya bloqueadores de contenido
- Prueba abrir: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` en tu navegador

#### Solución 1.2: Verificar orden de scripts
En `index.html`, el orden DEBE ser:
```html
1. <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
2. <script src="config/supabase.js"></script>
3. <script src="js/app.js"></script>
```

---

### ✅ Paso 2: Verificar credenciales de Supabase

**Abre `config/supabase.js` y verifica:**

```javascript
const SUPABASE_URL = 'https://rzaiebqdmewhbjpmvtha.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Verifica que:**
- ✅ La URL no tenga espacios al inicio/final
- ✅ La URL empiece con `https://`
- ✅ La anon key esté completa (debe ser muy larga)
- ✅ No haya comillas extra o caracteres raros

**Para obtener las credenciales correctas:**

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Selecciona tu proyecto
3. Ve a **Settings** > **API**
4. Copia:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

5. Actualiza `config/supabase.js` con estos valores

---

### ✅ Paso 3: Verificar que las tablas existan en Supabase

**En Supabase, ve a SQL Editor y ejecuta:**

```sql
-- Verificar que las tablas existan
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('events', 'admins');
```

**Debes ver 2 filas:** `events` y `admins`

**Si NO ves las tablas:**

1. Ve a **SQL Editor** en Supabase
2. Abre el archivo `config/schema.sql` de tu proyecto
3. Copia TODO el contenido
4. Pégalo en el SQL Editor
5. Click en **Run** o presiona `Ctrl+Enter`
6. Deberías ver mensajes de éxito

---

### ✅ Paso 4: Verificar Row Level Security (RLS)

**En Supabase SQL Editor, ejecuta:**

```sql
-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'events';
```

**Debes ver al menos una política:** `"Anyone can view approved events"`

**Si NO hay políticas:**

1. Ejecuta el archivo `config/schema.sql` completo de nuevo
2. O ejecuta manualmente estas políticas:

```sql
-- Política para que cualquiera pueda ver eventos aprobados
CREATE POLICY "Anyone can view approved events"
ON events FOR SELECT
USING (status = 'approved');
```

---

### ✅ Paso 5: Verificar que haya eventos aprobados

**En Supabase SQL Editor, ejecuta:**

```sql
-- Contar eventos aprobados
SELECT COUNT(*) as total_aprobados 
FROM events 
WHERE status = 'approved';

-- Ver los eventos aprobados
SELECT id, title, status 
FROM events 
WHERE status = 'approved';
```

**Si el resultado es 0:**

Tienes dos opciones:

#### Opción A: Aprobar eventos existentes
```sql
-- Ver eventos pendientes
SELECT id, title, status FROM events WHERE status = 'pending';

-- Aprobar un evento (cambia el ID)
UPDATE events SET status = 'approved' WHERE id = 1;
```

#### Opción B: Insertar eventos de prueba
1. Abre `config/insert_sample_events.sql`
2. Copia todo el contenido
3. Pégalo en SQL Editor de Supabase
4. Ejecuta

---

### ✅ Paso 6: Verificar errores en la consola del navegador

**Abre la consola (F12) y busca errores específicos:**

#### Error: "Failed to fetch" o "Network error"
**Causa:** Problema de conexión con Supabase

**Soluciones:**
1. Verifica que la URL de Supabase sea correcta
2. Verifica que no haya bloqueadores de CORS
3. En Supabase: **Settings** > **API** > **CORS**
   - Agrega tu dominio (o `*` para desarrollo)

#### Error: "relation 'events' does not exist"
**Causa:** La tabla no existe

**Solución:** Ejecuta `config/schema.sql` completo en Supabase

#### Error: "new row violates row-level security policy"
**Causa:** Problema con RLS

**Solución:** 
1. Verifica que las políticas RLS estén creadas (Paso 4)
2. Ejecuta el schema.sql completo de nuevo

#### Error: "Invalid API key"
**Causa:** La anon key es incorrecta

**Solución:** 
1. Ve a Supabase > Settings > API
2. Copia la anon key correcta
3. Actualiza `config/supabase.js`

---

### ✅ Paso 7: Probar la conexión manualmente

**Abre la consola del navegador (F12) y ejecuta:**

```javascript
// Verificar que supabase esté disponible
console.log('Supabase:', typeof window.supabase);

// Verificar que el cliente esté inicializado
console.log('Supabase client:', typeof supabase);

// Intentar una consulta manual
supabase
    .from('events')
    .select('*')
    .eq('status', 'approved')
    .then(({ data, error }) => {
        if (error) {
            console.error('❌ Error:', error);
        } else {
            console.log('✅ Eventos cargados:', data);
        }
    });
```

**Interpretación:**
- Si `window.supabase` es `undefined` → Problema con el CDN (Paso 1)
- Si `supabase` es `undefined` → Problema de inicialización (Paso 2)
- Si la consulta falla → Problema con la base de datos (Pasos 3-5)

---

## 🔧 Soluciones Rápidas por Problema

### Problema: "db is undefined"

**Causa:** El objeto `db` no se creó porque `supabase` no se inicializó

**Solución:**
1. Verifica que el CDN de Supabase se cargue (Paso 1)
2. Verifica las credenciales (Paso 2)
3. Abre la consola y verifica errores

### Problema: "Cargando eventos..." infinitamente

**Causa:** La consulta a Supabase está fallando silenciosamente

**Solución:**
1. Abre la consola (F12)
2. Busca errores en rojo
3. Sigue los pasos de diagnóstico según el error

### Problema: "No hay eventos disponibles"

**Causa:** No hay eventos con `status = 'approved'`

**Solución:**
1. Ejecuta el query del Paso 5
2. Si hay 0 eventos, aprueba algunos o inserta eventos de prueba

---

## 📝 Verificación Final

Después de seguir todos los pasos, verifica:

1. ✅ Consola muestra: `✅ Supabase library loaded successfully`
2. ✅ Consola muestra: `✅ Supabase client initialized successfully`
3. ✅ Consola muestra: `Cargados X eventos exitosamente` (donde X > 0)
4. ✅ Los eventos se muestran en la página
5. ✅ No hay errores en rojo en la consola

---

## 🆘 Si Nada Funciona

### Último Recurso: Reinstalar Todo

1. **En Supabase:**
   - Ve a **Database** > **Tables**
   - Elimina las tablas `events` y `admins` (si existen)
   - Ejecuta `config/schema.sql` completo de nuevo

2. **En tu código:**
   - Verifica que `index.html` tenga el orden correcto de scripts
   - Verifica que `config/supabase.js` tenga las credenciales correctas
   - Limpia la caché del navegador (Ctrl+Shift+R)

3. **Prueba en modo incógnito:**
   - Abre una ventana incógnito
   - Ve a tu aplicación
   - Esto descarta problemas de caché

---

## 📞 Información para Reportar Problemas

Si sigues teniendo problemas, recopila esta información:

1. **Mensajes de la consola** (F12 > Console)
2. **Errores de red** (F12 > Network > busca requests a Supabase)
3. **Resultado del query del Paso 5** (cuántos eventos aprobados hay)
4. **Versión del navegador** (Chrome, Firefox, etc.)
5. **Si estás en localhost o en Vercel**

---

## ✅ Checklist Rápido

- [ ] CDN de Supabase se carga (consola muestra ✅)
- [ ] Credenciales correctas en `config/supabase.js`
- [ ] Tablas `events` y `admins` existen en Supabase
- [ ] Políticas RLS están creadas
- [ ] Hay al menos 1 evento con `status = 'approved'`
- [ ] No hay errores en la consola del navegador
- [ ] La consulta manual funciona (Paso 7)

---

**¡Sigue estos pasos en orden y deberías resolver el problema!** 🎯
