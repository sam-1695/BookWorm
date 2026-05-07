import { Component, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, CurrentUser } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('BookWorm');
  currentUser$: Observable<CurrentUser | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }
}