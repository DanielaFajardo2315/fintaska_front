import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class Button {
  @Input() text: string = 'Click';
  @Input() color: string = 'primary';
  @Input() disabled: boolean = false;
  @Output() buttonClick = new EventEmitter<void>();

  get classes(): string {
    let base = `btn btn-${this.color}`;
    if (this.disabled) {
      base += ' disabled';
    }
    return base;
  }

  handleClick(event: Event) {
    if (this.disabled) {
      event.preventDefault();
    } else {
      console.log('Botón clickeado');
      this.buttonClick.emit();
    }
  }
}




