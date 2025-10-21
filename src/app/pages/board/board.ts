import { Component } from '@angular/core';
import { NotesBoard } from '../../components/notes-board/notes-board';
import { BoardFilter } from '../../components/board-filter/board-filter';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [NotesBoard, BoardFilter],
  templateUrl: './board.html',
  styleUrl: './board.css'
})
export class Board {

}
