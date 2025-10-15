import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { MoreButton } from './components/more-button/more-button';
import { Button } from './components/button/button';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, Login, CommonModule, Register],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('fintaska_front');
}
