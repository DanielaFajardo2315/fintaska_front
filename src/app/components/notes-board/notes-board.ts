import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardNote } from '../board-note/board-note';
import { BoardNoteDetail } from '../board-note-detail/board-note-detail';
import { Board } from '../../interfaces/board';
import { BoardService } from '../../services/board';

@Component({
  selector: 'app-notes-board',
  standalone: true,
  imports: [CommonModule, BoardNote, BoardNoteDetail],
  templateUrl: './notes-board.html',
  styleUrl: './notes-board.css'
})
export class NotesBoard {
  selectedNote: Board | null = null;
  showDetail: boolean = false;
  
  onOpenDetail(note: Board) {
    this.selectedNote = note;
    this.showDetail = true;
  }
  
  onCloseDetail() {
    this.showDetail = false;
    this.selectedNote = null;
  }
  
  onEditNote(note: Board) {
    console.log('Editar nota:', note);
    // Aquí puedes implementar la lógica de edición
    // Por ejemplo, abrir un modal de edición o navegar a una página de edición
  }
  
  onDeleteNote(note: Board) {
    console.log('Nota eliminada:', note);
    // Si estamos viendo la nota que se eliminó, cerrar la vista detallada
    if (this.selectedNote && this.selectedNote._id === note._id) {
      this.onCloseDetail();
    }
  }
}
