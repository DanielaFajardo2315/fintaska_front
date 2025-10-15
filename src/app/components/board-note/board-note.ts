import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Board } from '../../interfaces/board';
import { BoardService } from '../../services/board';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-board-note',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-note.html',
  styleUrl: './board-note.css',
})
export class BoardNote implements OnInit {
  @Input() note?: Board;
  @Output() openDetail = new EventEmitter<Board>();
  @Output() editNote = new EventEmitter<Board>();
  @Output() deleteNote = new EventEmitter<Board>();

  private boardService = inject(BoardService);
  allNotes: Board[] = [];
  environment = environment;
  visibleNotes: Set<string> = new Set(); // Para rastrear qué notas tienen archivos visibles

  ngOnInit() {
    this.loadBoards();
  }

  loadBoards() {
    console.log('Cargando notas...');

    this.boardService.getBoards().subscribe({
      next: (response: any) => {
        console.log('Respuesta de la API:', response);
        this.allNotes = response.data || response || [];
        console.log('Notas cargadas:', this.allNotes);
      },
      error: (error) => {
        console.error('Error al cargar las notas:', error);
        console.error('Detalles del error:', error.message);
        this.allNotes = [];
      },
    });
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

  onOpenDetail(note: Board) {
    this.openDetail.emit(note);
  }

  onEditNote(id: string) {
    console.log(id);
  }

  onDeleteNote(id: string) {
    this.boardService.deleteBoard(id).subscribe({
      next: (response:any) => {
        console.log(response);
        this.loadBoards(); // Recargar la lista después de eliminar
      },
      error: (error) => {
        console.error('Error al eliminar la nota:', error);
      },
    });
  }
}
