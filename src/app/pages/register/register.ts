import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [CommonModule , FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
 passwordVisible = false;
  confirmPasswordVisible = false;

  // Métodos para cambiar el estado
  togglePasswordVisible(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisible(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

}

