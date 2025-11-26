import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'theme-preference';
  private currentTheme: string = localStorage.getItem(this.STORAGE_KEY) || 'claro';
  public isDarkMode = new BehaviorSubject<boolean>(this.currentTheme === 'oscuro');

  constructor() {
    this.applyTheme(this.currentTheme);
  }

  // Acepta el tema como string
  setTheme(theme: 'claro' | 'oscuro'): void {
    if (this.currentTheme !== theme) {
      this.currentTheme = theme;
      localStorage.setItem(this.STORAGE_KEY, theme);
      this.applyTheme(theme);
      this.isDarkMode.next(theme === 'oscuro');
    }
  }

  // Lógica para aplicar dark-mode
  private applyTheme(theme: string): void {
    const body = document.body; 
    if (theme === 'oscuro') {
      body.classList.add('dark_mode');
    } else {
      body.classList.remove('dark_mode');
    }
  }

  // Metodo para obtener el tema actual
  getCurrentTheme(): string {
    return this.currentTheme;
  }
}
