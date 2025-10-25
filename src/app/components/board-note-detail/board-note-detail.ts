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
  styleUrl: './board-note-detail.css',
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
  selectedFile: File | null = null;
  selectedImage: File | null = null;

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

  onEditNote() {
    const boardToUpdate = new FormData();
    if (this.selectedImage) {
      boardToUpdate.append('urlImage', this.selectedImage);
    }
    if (this.selectedFile) {
      boardToUpdate.append('urlFile', this.selectedFile);
    }
    console.log('BoardToUpdate', boardToUpdate);
    console.log('id: ', this.note?._id);
    this._boardService.putBoard(boardToUpdate, this.note?._id || '').subscribe({
      next: (response: any) => {
        console.log(response.mensaje);
      },
      error: (error: any) => {
        console.error(error);
      }
    })
  }

  onDeleteNote(id: string) {
    this._boardService.deleteBoard(id).subscribe({
      next: (response: any) => {
        this.allNotes = response.data;
        console.log(this.allNotes);
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }
}
