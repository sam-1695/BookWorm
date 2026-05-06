import { Routes } from '@angular/router';
import { BookList } from './book/book-list/book-list';
import { BookCreate } from './book/book-create/book-create';
import { Library } from './pages/library/library';

export const routes: Routes = [
    { path: '', redirectTo: '/books', pathMatch: 'full' },
    { path: 'books', component: BookList },
    { path: 'create', component: BookCreate },
    { path: 'edit/:postId', component: BookCreate },
    { path: 'library', component: Library },
];
