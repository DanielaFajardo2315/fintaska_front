# Configuración de la API

## URL del Backend
Edita el archivo `src/environments/environment.ts` y cambia la URL:

```typescript
export const environment = {
    production: false,
    appUrl: 'http://localhost:3000' // ← Cambia esta URL por la de tu backend
}
```

## URLs Comunes:
- **Local**: `http://localhost:3000`
- **Local con puerto diferente**: `http://localhost:4000`
- **Backend en otra máquina**: `http://192.168.1.100:3000`
- **Backend en producción**: `https://tu-dominio.com`

## Verificar que tu backend esté funcionando:
1. Abre tu navegador
2. Ve a `http://localhost:3000/board` (o tu URL + /board)
3. Deberías ver un JSON con las notas

## Endpoints esperados:
- `GET /board` - Obtener todas las notas
- `POST /board` - Crear nueva nota
- `PUT /boards/:id` - Actualizar nota
- `DELETE /boards/:id` - Eliminar nota

## Formato de respuesta esperado:
```json
{
  "data": [
    {
      "_id": "123",
      "title": "Mi Nota",
      "description": "Descripción",
      "tag": ["tag1", "tag2"],
      "urlFile": ["archivo1.pdf"],
      "urlImage": ["imagen1.jpg"]
    }
  ]
}
```
