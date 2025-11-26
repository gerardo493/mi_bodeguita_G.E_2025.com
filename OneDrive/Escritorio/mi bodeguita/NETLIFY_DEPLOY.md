# 🚀 Guía Paso a Paso: Desplegar en Netlify

## ✅ Paso 1: Verificar que todo esté listo

Tu proyecto ya está configurado correctamente:
- ✅ `netlify.toml` creado
- ✅ `public/_redirects` creado
- ✅ Build funciona correctamente

## 📦 Paso 2: Subir tu código a GitHub

### 2.1 Si NO tienes Git inicializado:

```bash
# Inicializar Git
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Preparado para Netlify"
```

### 2.2 Crear repositorio en GitHub:

1. Ve a **https://github.com/new**
2. Nombre del repositorio: `mi-bodeguita` (o el que prefieras)
3. Puede ser **público** o **privado** (Netlify funciona con ambos)
4. **NO marques** "Add a README file"
5. Haz clic en **"Create repository"**

### 2.3 Conectar tu proyecto con GitHub:

```bash
# Reemplaza TU-USUARIO y TU-REPOSITORIO con tus datos
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git branch -M main
git push -u origin main
```

**Si te pide usuario y contraseña:**
- Usa un **Personal Access Token** de GitHub (no tu contraseña)
- Cómo crear uno: https://github.com/settings/tokens
- Permisos necesarios: `repo`

---

## 🌐 Paso 3: Desplegar en Netlify

### 3.1 Crear cuenta en Netlify:

1. Ve a **https://www.netlify.com**
2. Haz clic en **"Sign up"**
3. Selecciona **"Sign up with GitHub"**
4. Autoriza Netlify a acceder a tus repositorios

### 3.2 Crear nuevo sitio:

1. En el dashboard de Netlify, haz clic en **"Add new site"**
2. Selecciona **"Import an existing project"**
3. Elige **"Deploy with GitHub"**
4. Autoriza Netlify si es necesario

### 3.3 Seleccionar repositorio:

1. Busca y selecciona tu repositorio `mi-bodeguita`
2. Netlify detectará automáticamente la configuración:
   - **Build command:** `npm run build` ✅
   - **Publish directory:** `dist` ✅

### 3.4 Configuración (si no se detecta automáticamente):

Si Netlify no detecta la configuración, ingresa manualmente:

- **Base directory:** (dejar vacío)
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### 3.5 Desplegar:

1. Haz clic en **"Deploy site"**
2. Espera 2-3 minutos mientras Netlify:
   - Instala las dependencias
   - Ejecuta el build
   - Despliega tu sitio

### 3.6 ¡Listo! 🎉

Tu sitio estará disponible en una URL como:
**`tu-proyecto-aleatorio.netlify.app`**

---

## 🔧 Paso 4: Configuración Adicional (Opcional)

### 4.1 Cambiar el nombre del sitio:

1. Ve a **Site settings** > **Change site name**
2. Elige un nombre personalizado
3. Tu URL será: `tu-nombre.netlify.app`

### 4.2 Dominio personalizado:

1. Ve a **Domain settings**
2. Haz clic en **"Add custom domain"**
3. Ingresa tu dominio
4. Sigue las instrucciones para configurar DNS

### 4.3 Variables de entorno (si las necesitas):

1. Ve a **Site settings** > **Environment variables**
2. Agrega las variables que necesites
3. Haz clic en **"Redeploy"** para aplicar cambios

---

## 🔄 Actualizaciones Automáticas

Cada vez que hagas `git push` a GitHub:

1. Netlify detectará los cambios automáticamente
2. Iniciará un nuevo build
3. Desplegará la nueva versión
4. Te notificará por email cuando termine

---

## 🐛 Solución de Problemas

### Error: "Build failed"

**Solución:**
1. Ve a **Deploys** > Selecciona el deploy fallido
2. Revisa los **Build logs** para ver el error
3. Prueba localmente: `npm run build`
4. Si funciona localmente, verifica que todas las dependencias estén en `package.json`

### Error: "Cannot GET /ruta"

**Solución:**
- Verifica que el archivo `public/_redirects` existe
- O que `netlify.toml` tiene la configuración de redirects

### Las imágenes no cargan

**Solución:**
- Verifica que las rutas de imágenes sean relativas
- Las imágenes en `public/` se sirven desde la raíz

### El sitio muestra "Page not found" al recargar

**Solución:**
- Esto significa que el archivo `_redirects` no está funcionando
- Verifica que esté en la carpeta `public/`
- O que `netlify.toml` tenga la configuración correcta

---

## 📊 Monitoreo

Netlify te permite:
- Ver estadísticas de tráfico
- Ver logs en tiempo real
- Configurar notificaciones
- Ver el historial de deploys

---

## ✅ Checklist Final

Antes de desplegar, verifica:

- [ ] El proyecto compila: `npm run build`
- [ ] El archivo `netlify.toml` existe
- [ ] El archivo `public/_redirects` existe
- [ ] El código está en GitHub
- [ ] Tienes cuenta en Netlify

---

## 🎉 ¡Listo para Desplegar!

Sigue los pasos arriba y tu aplicación estará en línea en minutos.

**¿Necesitas ayuda?** Revisa los logs de build en Netlify o prueba localmente primero.

