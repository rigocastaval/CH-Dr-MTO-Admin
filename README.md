# Sistema de Administración Hospitalaria
## Guía de instalación paso a paso

---

## Archivos incluidos

```
hospital-system/
├── index.html           ← Pantalla de login
├── hospitalizacion.html ← Tabla de camas de hospitalización
├── urgencias.html       ← Tabla de camas de urgencias
├── admin.html           ← Panel de administrador (solo admin)
├── styles.css           ← Estilos visuales compartidos
├── supabase.js          ← Configuración de base de datos
├── supabase_setup.sql   ← Script SQL para crear las tablas
└── README.md            ← Esta guía
```

---

## PASO 1 — Crear la base de datos en Supabase

1. Ve a **https://supabase.com** y crea una cuenta gratuita
2. Clic en **"New project"**
3. Llénalo así:
   - **Name:** `hospital-sistema`
   - **Database password:** elige una contraseña segura (guárdala)
   - **Region:** `South America (São Paulo)` — es el más cercano a México
4. Espera 1-2 minutos a que el proyecto se cree

### Crear las tablas

5. En tu proyecto, clic en **"SQL Editor"** en el menú izquierdo
6. Clic en **"New query"**
7. Abre el archivo `supabase_setup.sql` de esta carpeta, copia TODO el contenido
8. Pégalo en el SQL Editor y presiona **"Run"** (botón verde)
9. Verás mensajes de éxito en verde

---

## PASO 2 — Obtener las claves de conexión

1. En tu proyecto Supabase, clic en **"Settings"** (engranaje, menú izquierdo)
2. Clic en **"API"**
3. Copia estos dos valores:
   - **Project URL** → algo como `https://abcdefghij.supabase.co`
   - **anon public** key → texto largo que empieza con `eyJ...`

### Pegar las claves en el código

4. Abre el archivo `supabase.js` con cualquier editor de texto
   (clic derecho → "Abrir con" → Bloc de Notas en Windows, TextEdit en Mac)
5. Reemplaza estas dos líneas:
   ```
   const SUPABASE_URL      = 'https://TUPROYECTO.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...';
   ```
   Con tus valores reales, por ejemplo:
   ```
   const SUPABASE_URL      = 'https://abcdefghij.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```
6. Guarda el archivo

---

## PASO 3 — Crear el primer usuario administrador

1. En Supabase, clic en **"Authentication"** → **"Users"**
2. Clic en **"Add user"** → **"Create new user"**
3. Ingresa:
   - Email: `admin@tuhospital.mx` (o el que prefieras)
   - Password: una contraseña segura
   - Activa **"Auto Confirm User"**
4. Clic en **"Create User"**
5. Copia el **UUID** del usuario que aparece en la lista

### Vincular el usuario a la tabla de perfiles

6. Ve a **"Table Editor"** → tabla `usuarios`
7. Clic en **"Insert row"**
8. Llena:
   - `auth_id`: pega el UUID que copiaste
   - `nombre`: tu nombre completo
   - `email`: el mismo correo
   - `rol`: `admin`
9. Clic en **"Save"**

---

## PASO 4 — Subir a GitHub Pages

### Crear repositorio en GitHub

1. Ve a **https://github.com** y crea una cuenta gratuita si no tienes
2. Clic en el botón **"+"** → **"New repository"**
3. Llénalo así:
   - **Repository name:** `hospital-sistema`
   - Selecciona **"Public"** (necesario para GitHub Pages gratis)
   - Activa **"Add a README file"**
4. Clic en **"Create repository"**

### Subir los archivos

5. En tu repositorio, clic en **"Add file"** → **"Upload files"**
6. Arrastra TODOS los archivos de la carpeta `hospital-sistema` a la ventana
7. En el campo de abajo escribe: `Primera versión del sistema`
8. Clic en **"Commit changes"**

### Activar GitHub Pages

9. En tu repositorio, clic en **"Settings"** (pestaña superior)
10. En el menú izquierdo, clic en **"Pages"**
11. En **"Source"**, selecciona **"Deploy from a branch"**
12. En **"Branch"**, selecciona **"main"** y **"/ (root)"**
13. Clic en **"Save"**
14. Espera 2-3 minutos

### Tu URL

Tu sistema estará disponible en:
```
https://TU-USUARIO-GITHUB.github.io/hospital-sistema/
```

---

## PASO 5 — Probar el sistema

1. Abre la URL de GitHub Pages en tu navegador
2. Inicia sesión con el email y contraseña del administrador que creaste
3. Verifica que puedas ver las tablas de camas
4. Prueba editar una cama
5. Desde el panel Administrador, crea un usuario Editor y un usuario Visor
6. Prueba iniciar sesión con esos usuarios para verificar los permisos

---

## Crear usuarios adicionales

Una vez dentro del sistema como Administrador:
1. Clic en **"Administrador"** en el menú lateral
2. Llena el formulario **"Agregar nuevo usuario"**
3. Elige el rol: Visor (solo lee) o Editor (puede editar)
4. Clic en **"Crear usuario"**

---

## Actualizar el sistema

Cuando necesites hacer cambios al código:
1. Edita los archivos en tu computadora
2. Ve a tu repositorio en GitHub
3. Clic en el archivo que cambiaste
4. Clic en el ícono del lápiz (editar)
5. Pega el nuevo contenido y guarda

O más fácil: en GitHub, clic en **"Add file"** → **"Upload files"** y sube los archivos modificados.

---

## Agregar más servicios en el futuro

Para agregar un nuevo servicio (UCI, Pediatría, etc.):

1. En Supabase SQL Editor, crea la nueva tabla:
   ```sql
   CREATE TABLE public.camas_uci (
     -- Copia la estructura de camas_hospitalizacion
   );
   ```
2. Duplica el archivo `hospitalizacion.html`
3. Cámbialo para que apunte a la nueva tabla
4. Agrega el enlace en el sidebar de todas las páginas
5. Sube los archivos a GitHub

---

## Soporte

Si algo no funciona:
- Revisa la consola del navegador (F12 → "Console") para ver errores
- Verifica que las claves en `supabase.js` sean correctas
- Asegúrate de haber ejecutado el SQL completo en Supabase

---

*Sistema desarrollado para gestión interna hospitalaria.*
