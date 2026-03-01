# 🍂 Seize — the day

Monitoreo de hábitos con rachas, calendarios y notificaciones. PWA instalable en Android.

---

## 🚀 Instalar en GitHub Pages (10 minutos)

### Paso 1 — Crear repositorio

1. Ve a **github.com** → **"New repository"**
2. Nombre: `seize`  *(exactamente ese nombre)*
3. Visibilidad: **Public**
4. NO marques ninguna casilla de Initialize
5. Clic en **"Create repository"**

### Paso 2 — Subir archivos

1. En el repo vacío → **"uploading an existing file"**
2. Extrae el ZIP y arrastra el **contenido** de la carpeta `seize-pwa/`:
   - index.html
   - manifest.json
   - sw.js
   - carpeta icons/ (con las 9 imágenes)
3. Commit: `Initial commit` → **"Commit changes"**

### Paso 3 — Activar GitHub Pages

1. **Settings** → **Pages** (menú lateral)
2. Source: branch `main`, folder `/ (root)` → **Save**
3. En ~2 min tu app estará en: `https://TU_USUARIO.github.io/seize/`

### Paso 4 — Instalar en el POCO X7 Pro

1. Abre **Chrome** → navega a tu URL de GitHub Pages
2. Toca el banner **"Instalar Seize"** que aparece arriba
3. Si no aparece: menú ⋮ → **"Añadir a pantalla de inicio"**
4. Dentro de la app: toca **"Activar notificaciones"**

---

## ❓ Problemas comunes

**404 al abrir desde el launcher** → Verifica que Pages esté en `main` y `/ (root)`.

**Sin ícono** → Abre la URL en Chrome primero (el SW descarga los íconos), luego agrega a inicio.

**Sin banner de instalación** → La URL debe ser HTTPS. Usa el menú ⋮ → "Añadir a pantalla de inicio".

**Sin notificaciones** → Ajustes POCO → Apps → Chrome → Notificaciones → activar.
