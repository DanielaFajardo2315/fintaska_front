import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
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
    this.refreshUserDataAndBoards();
  }

  // Cargar las notas
  loadBoards(notes: Board[]): void {
    console.log(`Cargando ${notes.length} notas`);
    this.allNotes = notes.map((note) => ({
      _id: note._id,
      title: note.title,
      tag: note.tag,
      urlFile: note.urlFile,
      urlImage: note.urlImage,
      description: note.description,
    }));
  }

  // Visibilidad de la carpeta con archivos en cada nota
  toggleVisibilidad(noteId: string) {
    if (this.visibleNotes.has(noteId)) {
      this.visibleNotes.delete(noteId);
    } else {
      this.visibleNotes.add(noteId);
    }
  }

  // Mostrar archivos en miniatura
  isVisible(noteId: string): boolean {
    return this.visibleNotes.has(noteId);
  }

  // Abrir el detalle de la nota
  onOpenDetail(note: Board) {
    this.openDetail.emit(note);
    console.log('ABRIENDO EL DETALLE DE LA NOTA');
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
      this.createNote();
    }
  }

  onImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      console.log(this.selectedImage);
      this.onEditNote();
      this.createNote();
    }
  }

  closeModal() {
    this.showNewNote = false; //PENDIENTE
  }

  // Crear nota
  createNote() {
    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched();
      return;
    }

    // Datos del formulario
    const noteData: Board = {
      _id: '',
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

    this._boardService.postBoard(noteData).subscribe({
      next: (res: any) => {
        if (!this.infoUser.planner) {
          this.infoUser.planner = {
            notifications: [],
            tasks: [],
            board: [],
            finances: [],
          };
        }

        // Obtener el ID de la nota creada
        let noteId: string | undefined;
        if (typeof res === 'object' && res !== null) {
          noteId = res._id || res.data?._id;
        }

        if (!noteId) {
          console.error('No se pudo obtener el ID de la nota creada. Respuesta:', res);
          return;
        }

        // Añadir el ID de la nota al array de boards del usuario
        this.infoUser.planner.board = [...(this.infoUser.planner.board || []), noteId];

        // Actualizar el usuario con la nueva nota
        this._userService.putUser(this.infoUser, this.idUser).subscribe({
          next: (updateRes: any) => {
            this.closeModal();
            // Limpiar el formulario después de crear
            this.noteForm.reset();
            // TODO: Actualizar calendario con la nueva nota
            this.refreshUserDataAndBoards();
          },
          error: (err: any) => {
            console.error(err.error.message);
          },
        });
      },
      error: (err:any) => {
        console.error(err.error.mensaje);
      }
    });
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

  // Actualizar la nota
  updateNote(note: Board) {
    this.selectedNoteForEdit = note;
    this.showEditDialog = true;
    this.onEditNote();
  }

  closeEditDialog() {
    this.showEditDialog = false;
    this.selectedNoteForEdit = undefined;
  }

  handleNoteEdited(editedNote: Board) {
    this.showEditDialog = false;
    this.selectedNoteForEdit = undefined;
    this.refreshUserDataAndBoards();
    // this.loadBoards();
  }

  // Eliminar la nota
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
            this.refreshUserDataAndBoards();
          }
        });
      },
      error: (error) => {
        console.error(error.error.mensaje);
      },
    });
  }
}
