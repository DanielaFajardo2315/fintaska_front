# Sistema de Notas - Miniaturas y Vista Detallada

## Cómo usar el sistema

### 1. Componente Principal: `app-notes-board`
Este es el componente contenedor que maneja la navegación entre miniaturas y vista detallada.

```html
<app-notes-board></app-notes-board>
```

### 2. Componentes Individuales

#### `app-board-note` (Miniatura)
- Muestra una vista resumida de la nota
- Al hacer clic, abre la vista detallada
- Incluye botones de acción (editar, eliminar)

#### `app-board-note-detail` (Vista Detallada)
- Muestra toda la información de la nota
- Incluye metadatos, archivos adjuntos, contenido completo
- Botón para volver a las miniaturas

### 3. Estructura de Datos

```typescript
interface Note {
  id: number;
  title: string;
  description: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  files: Array<{
    name: string;
    size: string;
  }>;
}
```

### 4. Eventos Disponibles

- `openDetail`: Abre la vista detallada
- `closeDetail`: Cierra la vista detallada
- `editNote`: Edita una nota
- `deleteNote`: Elimina una nota

### 5. Uso en tu aplicación

```typescript
// En tu componente principal
import { NotesBoard } from './components/notes-board/notes-board';

@Component({
  imports: [NotesBoard],
  template: '<app-notes-board></app-notes-board>'
})
export class YourComponent {}
```
