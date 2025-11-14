import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Board } from '../../interfaces/board';
import { BoardService } from '../../services/board';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/user';
import { LoginService } from '../../services/login';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-note-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './edit-note-dialog.html',
  styleUrl: './edit-note-dialog.css',
})
export class EditNoteDialog {
  @Input() note?: Board;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() noteUpdated = new EventEmitter<Board>();

  private _boardService = inject(BoardService);
  private _userService = inject(UserService);
  private _loginService = inject(LoginService);

  baseURL: string = environment.appUrl;
  showNewNote: boolean = false;
  idUser = this._loginService.infoUser();
  allNotes: Board[] = [];
  environment = environment;
  visibleNotes: Set<string> = new Set();
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
      console.log('Se ingresaron datos a editar en la recarga: ', this.note);

      this.noteForm.patchValue({
        title: this.editedNote.title,
        description: this.editedNote.description,
        tag: this.editedNote.tag ? this.editedNote.tag.join(', ') : undefined,
        urlFile: this.editedNote.urlFile ? this.editedNote.urlFile.join(', ') : undefined,
        urlImage: this.editedNote.urlImage ? this.editedNote.urlImage.join(', ') : undefined,
      })
    }
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
    }
  }

  onImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      console.log(this.selectedImage);
    }
  }

  onClose() {
    this.closeDialog.emit();
  }

  getFileName(url: string): string {
    const lastSlashIndex = url.lastIndexOf('/');
    return lastSlashIndex > -1 ? url.substring(lastSlashIndex + 1) : url;
  }

  saveBoardOperation() {
    // Crear FormData con los campos
    const noteData: Board = {
      _id: this.editedNote._id || '',
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
    
    if (this.editedNote._id) {
      return this.editNote(noteData);
    }

    const noteDataCreate: Board = {
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

    // const {_id, ...createData } = noteData;
    return this.createNote(noteDataCreate as Board);
  }

  createNote(data: Board) {
    console.log('dato en createNote: ', data);
    return this._boardService.postBoard(data);
  }

  editNote(data: Board) {
    if (!this.editedNote._id) {
      throw new Error('Id de la nota no disponible para actualización.');
    }
    return this._boardService.putBoard(data, this.editedNote._id);
  }

  handleNewNoteCreation(res:any){
    let noteId: string | undefined;
        if (typeof res === 'object' && res !== null) {
          noteId = res._id || res.data?._id;
        }

        if (!noteId) {
          console.error('No se pudo obtener el ID de la nota creada. Respuesta:', res);
          return;
        }

        if (!this.infoUser.planner) {
          this.infoUser.planner = {
            notifications: [],
            tasks: [],
            board: [],
            finances: [],
          };
        }

        // Añadir el ID de la nota al array de boards del usuario
        this.infoUser.planner.board = [...(this.infoUser.planner.board || []), noteId];

        console.log('Usuario para agregar id de la nota: ', this.infoUser);

        // Actualizar el usuario con la nueva nota
        this._userService.putUser(this.infoUser, this.idUser).subscribe({
          next: (updateRes: any) => {
            this.closeDialog.emit();
            // Limpiar el formulario después de crear
            this.noteForm.reset();
            // TODO: Actualizar calendario con la nueva nota
            this.refreshUserDataAndBoards();
          },
          error: (err: any) => {
            console.error(err.error.message);
          },
        });
  }

  onSave() {
    if (this.noteForm.invalid) {
      Swal.fire({
        title: 'Datos incompletos',
        text: 'Por favor, rellene el título de la nota.',
        icon: 'warning',
      });
      this.noteForm.markAllAsTouched();
      return;
    }

    // Estado actual (creación o edición)
    const isCreating = !this.editedNote._id;
    console.log('Nota NUEVA: ', isCreating);

    // Llamar el método dependiendo si es una creación o actualización
    const request = this.saveBoardOperation();

    request.subscribe({
      next: (response: any) => {
        console.log('Nota guardada:', response.data);
        Swal.fire({
          title: response.mensaje,
          icon: 'success',
          draggable: true,
        });

        if (isCreating === true){
          console.log('dato de la nota al entrar en el condicional', response);
          this.handleNewNoteCreation(response.data);
          console.log('ENTRÓ!');
        } else {
          // Emitir la respuesta (ya sea de crear o actualizar)
          this.noteUpdated.emit(response.data || response);
          this.closeDialog.emit();
          this.refreshUserDataAndBoards();
        }

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
