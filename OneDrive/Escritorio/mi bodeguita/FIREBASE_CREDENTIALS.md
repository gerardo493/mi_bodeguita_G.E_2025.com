# ✅ Firebase Configurado

## Credenciales Configuradas

Tu aplicación ya tiene las credenciales de Firebase configuradas:

- **Project ID**: `mi-bodeguita-624e2`
- **Auth Domain**: `mi-bodeguita-624e2.firebaseapp.com`
- **Storage Bucket**: `mi-bodeguita-624e2.firebasestorage.app`

## ⚠️ IMPORTANTE: Configurar Reglas de Firestore

Antes de usar la sincronización, debes configurar las reglas de seguridad:

1. Ve a: https://console.firebase.google.com/project/mi-bodeguita-624e2/firestore/rules

2. Reemplaza las reglas con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bodeguitas/{deviceId} {
      allow read, write: if true;
    }
  }
}
```

3. Haz clic en **"Publicar"**

## ✅ Verificar que Funciona

1. Recarga tu aplicación
2. Deberías ver el indicador de sincronización en la esquina inferior derecha
3. Si ves "Sincronizado" (verde), ¡todo está funcionando!

## 🔍 Verificar en Firebase Console

1. Ve a: https://console.firebase.google.com/project/mi-bodeguita-624e2/firestore/data
2. Deberías ver una colección llamada `bodeguitas`
3. Cuando agregues productos, aparecerán aquí automáticamente

¡Listo! Tu sincronización está configurada. 🎉

