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
import { switchMap, forkJoin, of, map } from 'rxjs';
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
  @Output() dataReloaded = new EventEmitter<void>();

  private _boardService = inject(BoardService);
  private _userService = inject(UserService);
  private _loginService = inject(LoginService);

  baseURL: string = environment.appUrl;
  showNewNote: boolean = false;
  idUser = this._loginService.infoUser();
  allNotes: Board[] = [];
  tags: string[] = [];
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

      this.tags = this.note.tag ? [...this.note.tag] : [];

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

  updateFile(id: string | undefined, type: string) {
    const key = type === 'image' ? 'urlImage' : 'urlFile';
    const value = type === 'image' ? this.selectedImage : this.selectedFile;

    if(!value) return null;

    const fileToEdit = new FormData();
    fileToEdit.append(key, value);

    return this._boardService.putBoard(fileToEdit, id);
  }

  addTag(event: any) {
    event.preventDefault(); // Evita que el formulario se envíe al dar Enter
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    // Validamos: que no esté vacío y que no esté repetido
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
      input.value = ''; // Limpiamos el input
      
      // Opcional: Limpiar el control del formulario si lo tienes vinculado
      this.noteForm.get('tag')?.setValue('');
    }
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
  }

  saveBoardOperation() {
    // Crear FormData con los campos
    const noteData: Board = {
      _id: this.editedNote._id || '',
      title: this.noteForm.value.title || '',
      tag: this.tags,
      description: this.noteForm.value.description || '',
    };

    let saveObservable$;
    if (this.editedNote._id) {
      saveObservable$ = this.editNote(noteData);
    } else {
      const {_id, ...newNoteData} = noteData;
      saveObservable$ = this.createNote(newNoteData as Board);
    }

    let finalNoteBase: Board;

    return saveObservable$.pipe(
      switchMap((res:any) => {
        console.log('Paso 1: nota actualizada/creada', res);

        finalNoteBase = res.data || res;

        const boardId = res._id || (res.data && res.data._id) || this.editedNote._id;

        if (!boardId) {
          console.error('¡ALERTA! No se pudo detectar el ID en la respuesta:', res);
          return of(res);
        }

        const uploadNotes = [];
        if (this.selectedImage) {
          const noteFile = this.updateFile(boardId, 'image');
          if (noteFile) uploadNotes.push(noteFile);
        }

        if (this.selectedFile) {
          const noteFile = this.updateFile(boardId, 'file');
          if (noteFile) uploadNotes.push(noteFile);
        }

        if (uploadNotes.length> 0) {
          return forkJoin(uploadNotes).pipe(
            // map(() => res)
          )
        } else {
          return of(res);
        }
      }),
      // Cargar la información actualizada
      map((uploadResults: any[] | Board) => {
            if (!Array.isArray(uploadResults)) {
                return uploadResults;
            }
            let currentNote = finalNoteBase;
            uploadResults.forEach(fileRes => {
                if (fileRes && fileRes.data) {
                    currentNote = fileRes.data; 
                }
            });
            return currentNote;
        })
    )
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
            this.refreshUserDataAndBoards();
            this.dataReloaded.emit();
            this.closeDialog.emit();
            // Limpiar el formulario después de crear
            this.noteForm.reset();
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

    const request = this.saveBoardOperation();

    request.subscribe({
      next: (response: any) => {
        console.log('Nota guardada:', response.data);
        
        if (isCreating === true){
          console.log('dato de la nota al entrar en el condicional', response);
          this.handleNewNoteCreation(response.data);
        } else {
          this.noteUpdated.emit(response.data || response);
          this.closeDialog.emit();
          this.refreshUserDataAndBoards();
        }

        Swal.fire({
          title: response.mensaje,
          icon: 'success',
          draggable: true,
        });
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
