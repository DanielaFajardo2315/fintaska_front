import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Board } from '../../interfaces/board';
import { BoardService } from '../../services/board';
import { environment } from '../../../environments/environment';
import { EditNoteDialog } from '../edit-note-dialog/edit-note-dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-board-note-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EditNoteDialog],
  templateUrl: './board-note-detail.html',
  styleUrl: './board-note-detail.css',
})
export class BoardNoteDetail {
  @Input() note: Board | null = null;
  @Output() closeDetail = new EventEmitter<void>();
  @Output() editNote = new EventEmitter<Board>();
  @Output() deleteNote = new EventEmitter<Board>();

  _boardService = inject(BoardService);
  visible: boolean = false;
  allNotes: Board[] = [];
  baseURL: string = environment.appUrl;
  selectedFile: File | null = null;
  selectedImage: File | null = null;
  selectedNoteForEdit?: Board;
  showEditDialog = false;

  toggleVisibilidad() {
    this.visible = !this.visible;
  }

  getFileName(url: string): string {
    const MAX_LENGTH = 28;

    const lastSlashIndex = url.lastIndexOf('/');
    let fileName = url;

    if (lastSlashIndex > -1) {
      fileName = url.substring(lastSlashIndex + 1);
    }
    return fileName;
  }

  // Subir archivos
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log(this.selectedFile);
      this.onEditNote();
    }
  }

  onImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      console.log(this.selectedImage);
      this.onEditNote();
    }
  }

  onCloseDetail() {
    this.closeDetail.emit();
  }

  // Actualizar la nota
  updateNote(note: Board) {
    this.selectedNoteForEdit = note;
    this.showEditDialog = true;
  }

  closeEditDialog() {
    this.showEditDialog = false;
    this.selectedNoteForEdit = undefined;
  }

  handleNoteEdited(editedNote: Board) {
    this.showEditDialog = false;
    this.selectedNoteForEdit = undefined;
  }

  onEditNote() {
    const boardToUpdate = new FormData();
    if (this.selectedImage) {
      boardToUpdate.append('urlImage', this.selectedImage);
    }
    if (this.selectedFile) {
      boardToUpdate.append('urlFile', this.selectedFile);
    }
    console.log('BoardToUpdate', boardToUpdate);
    console.log('id: ', this.note?._id);
    this._boardService.putBoard(boardToUpdate, this.note?._id || '').subscribe({
      next: (response: any) => {
        console.log(response.mensaje);
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  onDeleteNote(id: string) {
    this._boardService.deleteBoard(id).subscribe({
      next: (response: any) => {
        console.log(this.allNotes);
        this.allNotes = response.data;
        Swal.fire({
          title: '¿Deseas eliminar esta nota?',
          showCancelButton: true,
          confirmButtonText: 'Eliminar',
          cancelButtonAriaLabel: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire('Nota eliminada', '', 'success');
          }
        });
      },
      error: (error: any) => {
        console.error(error.error.mensaje);
      },
    });
  }
}
