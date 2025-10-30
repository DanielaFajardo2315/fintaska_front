import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Board } from '../../interfaces/board';
import { BoardService } from '../../services/board';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-note-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-note-dialog.html',
  styleUrl: './edit-note-dialog.css',
})
export class EditNoteDialog {
  @Input() note?: Board;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() noteUpdated = new EventEmitter<Board>();

  private boardService = inject(BoardService);
  baseURL: string = environment.appUrl;
  editedNote: Board = {
    _id: '',
    title: '',
    tag: [],
    urlFile: [],
    urlImage: [],
    description: '',
  };

  ngOnInit() {
    // Crear una copia de la nota para editar
    if (this.note) {
      this.editedNote = { ...this.note };
    }
  }

  onClose() {
    this.closeDialog.emit();
  }

  getFileName(url: string): string {
    const lastSlashIndex = url.lastIndexOf('/');
    return lastSlashIndex > -1 ? url.substring(lastSlashIndex + 1) : url;
  }

  onSave() {
    // Crear FormData con los campos
    const formData = new FormData();
    formData.append('title', this.editedNote.title || '');
    formData.append('description', this.editedNote.description || '');
    if (this.editedNote.tag && this.editedNote.tag.length > 0) {
      formData.append('tag', JSON.stringify(this.editedNote.tag));
    }

    // Si tenemos ID, actualizamos, si no, creamos
    const request = this.editedNote._id 
      ? this.boardService.putBoard(formData, this.editedNote._id)
      : this.boardService.postBoard(formData);

    request.subscribe({
      next: (response: any) => {
        console.log('Nota guardada:', response);
        Swal.fire({
          title: this.editedNote._id ? 'Nota actualizada' : 'Nota creada',
          icon: 'success',
          draggable: true,
        });
        
        // Emitir la respuesta (ya sea de crear o actualizar)
        this.noteUpdated.emit(response.data || response);
        this.closeDialog.emit();
      },
      error: (error) => {
        console.error('Error al guardar la nota:', error);
        Swal.fire({
          title: 'Error al guardar la nota',
          text: error.message || 'Intente de nuevo',
          icon: 'error',
          draggable: true,
        });
      },
    });
  }
}
