import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Board } from '../../interfaces/board';
import { BoardService } from '../../services/board';
import { environment } from '../../../environments/environment';
import { EditNoteDialog } from '../edit-note-dialog/edit-note-dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-board-note',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EditNoteDialog],
  templateUrl: './board-note.html',
  styleUrl: './board-note.css',
})
export class BoardNote implements OnInit {
  @Input() note?: Board;
  @Input() limit?: number;
  @Output() openDetail = new EventEmitter<Board>();
  @Output() editNote = new EventEmitter<Board>();
  @Output() deleteNote = new EventEmitter<Board>();

  private boardService = inject(BoardService);
  _boardService = inject(BoardService);
  allNotes: Board[] = [];
  environment = environment;
  visibleNotes: Set<string> = new Set();
  baseURL: string = environment.appUrl;
  selectedFile: File | null = null;
  selectedImage: File | null = null;
  showEditDialog = false;
  selectedNoteForEdit?: Board;

  // Limitar el largo del titulo
  titleNote(title: string): string {
    const length_title = 20;
    if (title.length > length_title) {
      return title.substring(0, length_title) + '...';
    }
    return title;
  }

  // Limitar el largo de la descripción
  descriptionNote(description: string): string {
    const length_descript = 80;
    if (description.length > length_descript) {
      return description.substring(0, length_descript) + '...';
    }
    return description;
  }

  // Obtener solo el nombre del archivo
  getFileName(url: string): string {
    const MAX_LENGTH = 28;

    const lastSlashIndex = url.lastIndexOf('/');
    let fileName = url;

    if (lastSlashIndex > -1) {
      fileName = url.substring(lastSlashIndex + 1);
    }

    if (fileName.length > MAX_LENGTH) {
      return fileName.substring(0, MAX_LENGTH) + '...';
    }
    return fileName;
  }

  ngOnInit() {
    this.loadBoards();
  }

  // Cargar las notas
  loadBoards() {
    console.log('Cargando notas...');
    try {
      const stored = localStorage.getItem('userProfile');
      const userProfile = stored ? JSON.parse(stored) : null;

      if (userProfile && userProfile.planner && Array.isArray(userProfile.planner.board)) {
        this.allNotes = userProfile.planner.board;
      } else {
        this.allNotes = [];
      }
    } catch (err) {
      console.error('Error parsing userProfile from localStorage', err);
      this.allNotes = [];
    }

    console.log('Notas cargadas desde localStorage:', this.allNotes);
    // this.boardService.getBoards().subscribe({
    //   next: (response: any) => {
    //     console.log('Respuesta de la API:', response);
    //     this.allNotes = response.data || response || [];
    //     console.log('Notas cargadas:', this.allNotes);
    //   },
    //   error: (error) => {
    //     console.error('Error al cargar las notas:', error);
    //     console.error('Detalles del error:', error.message);
    //     this.allNotes = [];
    //   },
    // });
  }

  toggleVisibilidad(noteId: string) {
    if (this.visibleNotes.has(noteId)) {
      this.visibleNotes.delete(noteId);
    } else {
      this.visibleNotes.add(noteId);
    }
  }

  isVisible(noteId: string): boolean {
    return this.visibleNotes.has(noteId);
  }

  // Abrir el detalle de la nota
  onOpenDetail(note: Board) {
    this.openDetail.emit(note);
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
        this.loadBoards();
      },
      error: (error: any) => {
        console.error(error);
      },
    });
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
    this.loadBoards();
  }

  // Eliminar la nota
  onDeleteNote(id: string) {
    this.boardService.deleteBoard(id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.loadBoards();
        Swal.fire({
          title: '¿Deseas eliminar esta nota?',
          showCancelButton: true,
          confirmButtonText: 'Eliminar',
          cancelButtonAriaLabel: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire('Nota eliminada', '', 'success');
          }
        });
      },
      error: (error) => {
        console.error(error.error.mensaje);
      },
    });
  }
}
