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
  tagsWithCount: TagCount[] = [];
  notes: Board[] = [];
  showEditDialog = false;

  tagInput = new FormGroup({
    tagForm: new FormControl('', [Validators.required])
  })
  
  // Métodos para el diálogo de creación de nota
  onCreateNote() {
    this.showEditDialog = true;
  }

  closeEditDialog() {
    this.showEditDialog = false;
  }

  handleNoteCreated(newNote: Board) {
    this.closeEditDialog();
    this.loadAllBoards(); // Recargar la lista después de crear
  }

  showNotes() {
    this._boardService.getBoards().subscribe({
      next: (response: any) => {
        this.notes = response.data;
        console.log(this.notes);
      },

      error: (error: any) => {
        console.error(error);
      },
    });
  }
  ngOnInit(): void {
    this.showNotes();
  }

  ngOnInitTag(): void {
    this.loadAllBoards();
  }

  loadAllBoards(): void {
    this._boardService.getBoards().subscribe({
      next: (response: any) => {
        this.notes = response.data;
        this.tagsWithCount = this.getTagsWithCount(this.notes);
        console.log('Conteo de Etiquetas:', this.tagsWithCount);
      },
      error: (error: any) => {
        console.error(error);
        
      }
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

    return Array.from(tagMap.entries())
      .map(([name, count]) => ({
        name: name,
        count: count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  showNotesByTag(tag?: string): void {
    const tagValue = (tag && tag.length > 0)
      ? tag
      : (this.tagInput?.value?.tagForm || '').toString().trim();

    if (!tagValue) {
      console.warn('No se proporcionó una etiqueta para filtrar');
      return;
    }

    console.log('Tag para filtrar:', tagValue);
    this._boardService.getBoardsByTag(tagValue).subscribe({
      next: (response: any) => {
        this.notes = response.data;
        console.log(this.notes);
      },

      error: (error: any) => {
        console.error(error);
      },
    });
  }
}
