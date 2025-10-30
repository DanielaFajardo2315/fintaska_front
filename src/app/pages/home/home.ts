import { Component } from '@angular/core';
import { BoardNote } from '../../components/board-note/board-note';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [BoardNote, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
}
