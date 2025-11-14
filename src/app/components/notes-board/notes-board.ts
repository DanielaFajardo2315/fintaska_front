import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardNote } from '../board-note/board-note';
import { BoardNoteDetail } from '../board-note-detail/board-note-detail';
import { Board } from '../../interfaces/board';
import { BoardService } from '../../services/board';
import { LoginService } from '../../services/login';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-notes-board',
  standalone: true,
  imports: [CommonModule, BoardNote, BoardNoteDetail],
  templateUrl: './notes-board.html',
  styleUrl: './notes-board.css',
})
export class NotesBoard {
  selectedNote: Board | null = null;
  showDetail: boolean = false;
  private _loginService = inject(LoginService);
  private _userService = inject(UserService);

  idUser = this._loginService.infoUser();
  allNotes: Board[] = [];

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

  onNoteUpdated(updatedNote: Board): void {
    this.selectedNote = updatedNote;
  }

  onOpenDetail(note: Board) {
    this.selectedNote = note;
    this.showDetail = true;
  }

  onCloseDetail() {
    this.showDetail = false;
    this.selectedNote = null;
  }

  onDeleteNote(note: Board) {
    console.log('Nota eliminada:', note);
    // Si estamos viendo la nota que se eliminó, cerrar la vista detallada
    if (this.selectedNote && this.selectedNote._id === note._id) {
      this.onCloseDetail();
    }
  }
}
