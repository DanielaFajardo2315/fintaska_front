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
  baseURL: string = environment.appUrl;

  titleNote(title: string):string{
    const length_title = 20;
    if (title.length > length_title){
      return title.substring(0, length_title) + '...';
    }
    return title;
  }

  descriptionNote(description: string):string{
    const length_descript = 80;
    if (description.length > length_descript){
      return description.substring(0, length_descript) + '...';
    }
    return description;
  }

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

  onOpenDetail(note: Board) {
    this.openDetail.emit(note);
  }

  onEditNote(id: string) {
    console.log(id);
  }

  onDeleteNote(id: string) {
    this.boardService.deleteBoard(id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.loadBoards(); // Recargar la lista después de eliminar
      },
      error: (error) => {
        console.error('Error al eliminar la nota:', error);
      },
    });
  }
}
