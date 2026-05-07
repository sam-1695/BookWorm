import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { App } from './app';
import { BookCreate } from './book/book-create/book-create';
import { BookList } from './book/book-list/book-list';
import { FriendCreate } from './friend/friend-create/friend-create';
import { FriendList } from './friend/friend-list/friend-list';
import { Header } from './header/header/header';

import { routes } from './app.router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { Profile } from './pages/profile/profile';
import { Friends } from './pages/friends/friends';
import { Library } from './pages/library/library';
import { Explore } from './pages/explore/explore';
import { Login } from './pages/login/login';

@NgModule({
  declarations: [
    App,
    BookCreate,
    BookList,
    FriendCreate,
    FriendList,
    Header,

    Profile,
    Friends,
    Library,
    Explore,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),

    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatIconModule,
    FormsModule,

    Login,
  ],
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient()],
  bootstrap: [App],
})
export class AppModule {}