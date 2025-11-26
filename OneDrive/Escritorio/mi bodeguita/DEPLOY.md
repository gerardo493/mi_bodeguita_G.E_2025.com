# 🚀 Guía de Despliegue - Mi Bodeguita

Esta guía te ayudará a subir tu aplicación React a internet de forma gratuita y fácil.

## 📋 Opciones de Hosting Recomendadas

### 1. **Vercel** (⭐ RECOMENDADO - Más fácil)
- ✅ Gratis
- ✅ Despliegue automático desde GitHub
- ✅ SSL/HTTPS incluido
- ✅ Dominio personalizado gratis
- ✅ Muy rápido y fácil

### 2. **Netlify**
- ✅ Gratis
- ✅ Despliegue automático desde GitHub
- ✅ SSL/HTTPS incluido
- ✅ Dominio personalizado gratis

### 3. **Render**
- ✅ Gratis (con limitaciones)
- ✅ Fácil de usar
- ✅ SSL incluido

---

## 🎯 Método 1: Vercel (RECOMENDADO)

### Paso 1: Preparar el proyecto

1. **Asegúrate de que el proyecto compile correctamente:**
   ```bash
   npm run build
   ```

2. **Verifica que la carpeta `dist` se haya creado correctamente**

### Paso 2: Subir a GitHub

1. **Inicializa Git (si no lo has hecho):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Crea un repositorio en GitHub:**
   - Ve a https://github.com/new
   - Crea un nuevo repositorio (puede ser privado o público)
   - NO marques "Initialize with README"

3. **Conecta tu proyecto con GitHub:**
   ```bash
   git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
   git branch -M main
   git push -u origin main
   ```

### Paso 3: Desplegar en Vercel

1. **Ve a https://vercel.com**
2. **Inicia sesión con tu cuenta de GitHub**
3. **Haz clic en "Add New Project"**
4. **Importa tu repositorio de GitHub**
5. **Configuración automática:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. **Haz clic en "Deploy"**
7. **¡Listo!** Tu app estará en línea en 1-2 minutos

### Paso 4: Configurar para React Router

Vercel necesita un archivo de configuración para que las rutas funcionen correctamente. Crea el archivo `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🎯 Método 2: Netlify

### Paso 1: Subir a GitHub
(Sigue los pasos del Método 1, Paso 2)

### Paso 2: Desplegar en Netlify

1. **Ve a https://www.netlify.com**
2. **Inicia sesión con tu cuenta de GitHub**
3. **Haz clic en "Add new site" > "Import an existing project"**
4. **Selecciona tu repositorio de GitHub**
5. **Configuración:**
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **Haz clic en "Deploy site"**

### Paso 3: Configurar para React Router

Crea el archivo `public/_redirects` (sin extensión):

```
/*    /index.html   200
```

O crea `netlify.toml` en la raíz del proyecto:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🎯 Método 3: Render

### Paso 1: Subir a GitHub
(Sigue los pasos del Método 1, Paso 2)

### Paso 2: Desplegar en Render

1. **Ve a https://render.com**
2. **Inicia sesión con tu cuenta de GitHub**
3. **Haz clic en "New +" > "Static Site"**
4. **Conecta tu repositorio de GitHub**
5. **Configuración:**
   - Name: `mi-bodeguita` (o el nombre que prefieras)
   - Build Command: `npm run build`
   - Publish Directory: `dist`
6. **Haz clic en "Create Static Site"**

---

## ⚙️ Configuración Adicional

### Archivo `vercel.json` (para Vercel)

Crea este archivo en la raíz del proyecto:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Archivo `netlify.toml` (para Netlify)

Crea este archivo en la raíz del proyecto:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Archivo `_redirects` (alternativa para Netlify)

Crea el archivo `public/_redirects` (sin extensión):

```
/*    /index.html   200
```

---

## 🔧 Solución de Problemas

### Error: "Cannot GET /ruta"
**Solución:** Asegúrate de tener el archivo de configuración de redirecciones (`vercel.json`, `netlify.toml` o `_redirects`)

### Error: "Build failed"
**Solución:** 
1. Verifica que el proyecto compile localmente: `npm run build`
2. Revisa los logs de error en la plataforma de hosting
3. Asegúrate de que todas las dependencias estén en `package.json`

### Las imágenes no se cargan
**Solución:** Verifica que las rutas de las imágenes sean relativas (no absolutas)

### El estado se pierde al recargar
**Solución:** Esto es normal - los datos se guardan en localStorage del navegador. Si quieres persistencia en la nube, necesitarías un backend.

---

## 📝 Notas Importantes

1. **Datos Locales:** Tu aplicación guarda los datos en el localStorage del navegador. Si quieres que los datos persistan entre dispositivos, necesitarías:
   - Un backend (Firebase, Supabase, etc.)
   - Una base de datos en la nube

2. **Variables de Entorno:** Si necesitas variables de entorno, configúralas en el panel de tu plataforma de hosting.

3. **Dominio Personalizado:** Todas las plataformas permiten agregar tu propio dominio de forma gratuita.

4. **Actualizaciones:** Cada vez que hagas `git push`, el sitio se actualizará automáticamente.

---

## 🎉 ¡Listo!

Una vez desplegado, tendrás una URL como:
- Vercel: `tu-proyecto.vercel.app`
- Netlify: `tu-proyecto.netlify.app`
- Render: `tu-proyecto.onrender.com`

¡Comparte tu aplicación con el mundo! 🚀

