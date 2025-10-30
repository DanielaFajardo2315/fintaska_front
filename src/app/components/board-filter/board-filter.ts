import { Component, Input, inject } from '@angular/core';
import { Board } from '../../interfaces/board';
import { BoardService } from '../../services/board';
import { BoardNote } from '../board-note/board-note';
import { MoreButton } from '../more-button/more-button';

interface TagCount {
  name: string;
  count: number;
}

@Component({
  selector: 'app-board-filter',
  imports: [MoreButton],
  templateUrl: './board-filter.html',
  styleUrl: './board-filter.css',
})
export class BoardFilter {
  @Input() note: BoardNote | null = null;

  private _boardService = inject(BoardService);
  tagsWithCount: TagCount[] = [];
  notes: Board[] = [];

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


  showNotesByTag(tag: string): void {
    this._boardService.getBoardsByTag(tag).subscribe({
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
