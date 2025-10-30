import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-more-button',
  imports: [],
  templateUrl: './more-button.html',
  styleUrl: './more-button.css'
})
export class MoreButton {
  @Output() buttonClick = new EventEmitter<void>();

  onClick() {
    this.buttonClick.emit();
  }
}
