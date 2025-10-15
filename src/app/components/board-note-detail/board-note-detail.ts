import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Board } from '../../interfaces/board';
import { BoardService } from '../../services/board';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-board-note-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-note-detail.html',
  styleUrl: './board-note-detail.css'
})
export class BoardNoteDetail {
  @Input() note: Board | null = null;
  @Output() closeDetail = new EventEmitter<void>();
  @Output() editNote = new EventEmitter<Board>();
  @Output() deleteNote = new EventEmitter<Board>();
  
  _boardService = inject(BoardService);
  visible: boolean = false;
  allNotes: Board[] = [];
  baseURL: string = environment.appUrl;
  
  toggleVisibilidad() {
    this.visible = !this.visible;
  }

  
  // showNotes(){
  //   this._boardService.getBoards().subscribe({
  //     next: (response:any)=>{
  //       this.allNotes = response.data;
  //       console.log(this.allNotes);
  //     },
  //     error: (error:any)=>{
  //       console.error(error);
        
  //     }
  //   });
  // }
  
  onCloseDetail() {
    this.closeDetail.emit();
  }
  
  onEditNote() {
    if (this.note) {
      this.editNote.emit(this.note);
    }
  }
  
  onDeleteNote(id:string) {
        this._boardService.deleteBoard(id).subscribe({
      next: (response:any)=>{
        this.allNotes = response.data;
        console.log(this.allNotes);
      },
      error: (error: any)=>{
        console.error(error);
        
      }
    });
  }

  // ngOnInit(): void {
  //   this.showNotes();
  // }
}
