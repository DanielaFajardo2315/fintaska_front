import { Component, Input, Output, EventEmitter, OnInit, inject, OutputEmitterRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Board } from '../../interfaces/board';
import { BoardService } from '../../services/board';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/user';
import { LoginService } from '../../services/login';
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
  @Output() noteUpdated = new EventEmitter<Board>();

  private _boardService = inject(BoardService);
  private _userService = inject(UserService);
  private _loginService = inject(LoginService);

  showNewNote: boolean = false;
  idUser = this._loginService.infoUser();
  allNotes: Board[] = [];
  environment = environment;
  visibleNotes: Set<string> = new Set();
  baseURL: string = environment.appUrl;
  selectedFile: File | null = null;
  selectedImage: File | null = null;
  showEditDialog = false;
  selectedNoteForEdit?: Board;
  visible: boolean = false;

  // Información del formulario
  noteForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    tag: new FormControl<string | undefined>(undefined),
    urlFile: new FormControl<string | undefined>(undefined),
    urlImage: new FormControl<string | undefined>(undefined),
    description: new FormControl<string | undefined>(undefined),
  });

  // Información del usuario registrado
  infoUser: User = {
    planner: {
      notifications: [],
      tasks: [],
      board: [],
      finances: [],
    },
    _id: '',
    fullName: '',
    username: '',
    email: '',
    rol: 'usuario',
  };

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

  // Cargar las notas
  loadBoards(notes: Board[]): void {
    console.log(`Cargando ${notes} notas`);
    this.allNotes = notes.map((note) => ({
      _id: note._id,
      title: note.title,
      tag: note.tag,
      urlFile: note.urlFile,
      urlImage: note.urlImage,
      description: note.description,
    }));
  }

  // traer datos de usuario y notas
  refreshUserDataAndBoards(): void {
    if (!this.idUser) {
      console.log('ID de usuario no disponible. No se pueden cargar los datos');
      return;
    }
    this._userService.getUserById(this.idUser).subscribe({
      next: (res: any) => {
        const { password, ...rest } = res.data;
        this.infoUser = { ...rest };

        if (this.infoUser.planner && this.infoUser.planner.board) {
          const populatedTask = Array.isArray(this.infoUser.planner.board)
            ? (this.infoUser.planner.board as Board[])
            : [];
          this.loadBoards(populatedTask);
        }
      },
      error(err: any) {
        console.error('Error al cargar datos de usuario en tablero: ', err);
      },
    });
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

  // Cargar información a editar en el formulario
  loadNoteToEdit(noteEdit: Board) {
    this.selectedNoteForEdit = noteEdit;

    this.noteForm.patchValue({
      title: noteEdit.title,
      tag: noteEdit.tag ? noteEdit.tag.join(', ') : undefined,
      urlFile: noteEdit.urlFile && noteEdit.urlFile.length > 0 ? noteEdit.urlFile[0] : undefined,
      urlImage:
        noteEdit.urlImage && noteEdit.urlImage.length > 0 ? noteEdit.urlImage[0] : undefined,
      description: noteEdit.description,
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
    this.noteUpdated.emit(editedNote);
    this.note = editedNote;
  }

  onEditNote() {
    if (this.noteForm.invalid || !this.selectedNoteForEdit) {
      this.noteForm.markAllAsTouched();
      return;
    }

    const idToUpdate = this.selectedNoteForEdit._id;

    if (!idToUpdate) {
      console.error('No se pudo obtener el ID de la nota seleccionada para la actualización.');
      return;
    }

    const noteData: Board = {
      _id: idToUpdate,
      title: this.noteForm.value.title || '',
      tag: this.noteForm.value.tag
        ? this.noteForm.value.tag.split(',').map((s) => s.trim())
        : undefined,
      urlFile: this.noteForm.value.urlFile
        ? this.noteForm.value.urlFile.split(',').map((s) => s.trim())
        : undefined,
      urlImage: this.noteForm.value.urlImage
        ? this.noteForm.value.urlImage.split(',').map((s) => s.trim())
        : undefined,
      description: this.noteForm.value.description || '',
    };
    // Control de las imagenes y archivos
    // if (this.selectedImage) {
    //   let updateImage = noteData.urlImage;
    //   return;
    // }
    // if (this.selectedFile) {
    //   let updateFile = noteData.urlFile;
    //   return;
    // }
    this._boardService.putBoard(noteData, idToUpdate).subscribe({
      next: (response: any) => {
        console.log(response.mensaje);
        this.refreshUserDataAndBoards();
      },
      error: (err: any) => {
        console.error(err.error.mensaje);
      },
    });
  }

  onDeleteNote(noteDelete: Board) {
    const IdForDelete = noteDelete._id;
    if (!IdForDelete) {
      console.error('No se obtiene ID  de la nota a eliminar');
      return;
    }
    this._boardService.deleteBoard(IdForDelete).subscribe({
      next: (response: any) => {
        console.log(response.mensaje);
        this.refreshUserDataAndBoards();
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
      error: (error) => {
        console.error(error.error.mensaje);
      },
    });
  }
}
