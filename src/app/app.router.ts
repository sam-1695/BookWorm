import { Routes } from '@angular/router';
import { BookList } from './book/book-list/book-list';
import { BookCreate } from './book/book-create/book-create';
import { Library } from './pages/library/library';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';
import { Friends } from './pages/friends/friends';
import { Explore } from './pages/explore/explore';

// ANGULAR ROUTING
// defines all app routes using Angular Router
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'profile', component: Profile },
  { path: 'friends', component: Friends },
  { path: 'library', component: Library },
  { path: 'explore', component: Explore },
  { path: 'books', component: BookList },
  { path: 'create', component: BookCreate },
  { path: 'edit/:postId', component: BookCreate },
];
