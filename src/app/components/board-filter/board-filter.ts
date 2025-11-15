import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Board } from '../../interfaces/board';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BoardService } from '../../services/board';
import { BoardNote } from '../board-note/board-note';
import { MoreButton } from '../more-button/more-button';
import { EditNoteDialog } from '../edit-note-dialog/edit-note-dialog';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/user';
import { LoginService } from '../../services/login';

interface TagCount {
  name: string;
  count: number;
}

@Component({
  selector: 'app-board-filter',
  imports: [MoreButton, EditNoteDialog, ReactiveFormsModule],
  templateUrl: './board-filter.html',
  styleUrl: './board-filter.css',
})
export class BoardFilter {
  @Input() note: BoardNote | null = null;

  private _boardService = inject(BoardService);
  private _userService = inject(UserService);
  private _loginService = inject(LoginService);

  idUser = this._loginService.infoUser();
  showNewNote: boolean = false;
  tagsWithCount: TagCount[] = [];
  allNotes: Board[] = [];
  showEditDialog = false;

  tagInput = new FormGroup({
    tagForm: new FormControl('', [Validators.required]),
  });

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

  closeModal() {
    this.showNewNote = false; //PENDIENTE
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

          this.tagsWithCount = this.getTagsWithCount(this.allNotes);
          console.log('Conteo de etiquetas en este usuario: ', this.tagsWithCount);
        }
      },
      error(err: any) {
        console.error('Error al cargar datos de usuario en tablero: ', err);
      },
    });
  }

  // Métodos para el diálogo de creación de nota
  onCreateNote() {
    this.showEditDialog = true;
    this.refreshUserDataAndBoards();
  }

  closeEditDialog() {
    this.showEditDialog = false;
  }

  handleNoteCreated(newNote: Board) {
    this.closeEditDialog();
    this.refreshUserDataAndBoards();
  }

  ngOnInit(): void {
    this.refreshUserDataAndBoards();
  }

  ngOnInitTag(): void {
    this.loadAllBoards();
  }

  loadAllBoards(): void {
    this._boardService.getBoards().subscribe({
      next: (response: any) => {
        this.allNotes = response.data;
        this.tagsWithCount = this.getTagsWithCount(this.allNotes);
        console.log('Conteo de Etiquetas:', this.tagsWithCount);
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  getTagsWithCount(notes: Board[]): TagCount[] {
    const tagMap = new Map<string, number>();
    notes.forEach((noteTag) => {
      if (noteTag.tag && noteTag.tag.length > 0) {
        noteTag.tag.forEach((tag) => {
          const lowerTag = tag.toLowerCase();
          const currentCount = tagMap.get(lowerTag) || 0;
          tagMap.set(lowerTag, currentCount + 1);
        });
      }
    });
    console.log('arreglo de tags: ', tagMap);

    return Array.from(tagMap.entries())
      .map(([name, count]) => ({
        name: name,
        count: count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  getUserNoteIds(): string[] {
    if (this.infoUser.planner && Array.isArray(this.infoUser.planner.board)) {
        return this.infoUser.planner.board.map(note => note).filter((id): id is string => !!id);
    }
    return [];
}

  showNotesByTag(tag?: string): void {
    const tagValue =
      tag && tag.length > 0 ? tag : (this.tagInput?.value?.tagForm || '').toString().trim();

    if (!tagValue) {
      console.warn('No se proporcionó una etiqueta para filtrar');
      return;
    }

    console.log('Tag para filtrar:', tagValue);
    this._boardService.getBoardsByTag(tagValue).subscribe({
      next: (response: any) => {
        const allFilteredNotes = response.data || [];
        const userNoteIds = this.getUserNoteIds();

        this.allNotes = allFilteredNotes.filter((note: Board) => userNoteIds.includes(note._id || ''));
        console.log(this.allNotes);
      },

      error: (error: any) => {
        console.error(error);
      },
    });
  }
}
