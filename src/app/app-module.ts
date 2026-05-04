// import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';

// import { App } from './app';
// import { BookCreate } from './book/book-create/book-create';
// import { BookList } from './book/book-list/book-list';
// import { FriendCreate } from './friend/friend-create/friend-create';
// import { FriendList } from './friend/friend-list/friend-list';
// import { Header } from './header/header/header';


// import { routes } from './app.router';
// import { MatButtonModule } from '@angular/material/button';
// import { MatCardModule } from '@angular/material/card';
// import { MatExpansionModule } from '@angular/material/expansion';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { FormsModule } from '@angular/forms';
// import { RouterOutlet } from '@angular/router';

// @NgModule({
//   declarations: [App, BookCreate, BookList, FriendCreate, FriendList, Header],
//   imports: [BrowserModule, MatButtonModule, MatCardModule, MatExpansionModule, MatFormFieldModule, MatInputModule, MatToolbarModule, FormsModule, RouterOutlet],
//   providers: [provideBrowserGlobalErrorListeners()],
//   bootstrap: [App],
// })

// export class AppModule {}
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router'; // 👈 Change RouterOutlet to RouterModule

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
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [App, BookCreate, BookList, FriendCreate, FriendList, Header],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    FormsModule,
  ],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}