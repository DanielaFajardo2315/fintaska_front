import { Component } from '@angular/core';
import { NotesBoard } from '../../components/notes-board/notes-board';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [NotesBoard],
  templateUrl: './board.html',
  styleUrl: './board.css'
})
export class Board {

}
