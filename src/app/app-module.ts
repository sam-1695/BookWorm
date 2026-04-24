import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { App } from './app';
import { BookCreate } from './book/book-create/book-create';
import { BookList } from './book/book-list/book-list';
import { FriendCreate } from './friend/friend-create/friend-create';
import { FriendList } from './friend/friend-list/friend-list';
import { Header } from './header/header/header';

@NgModule({
  declarations: [App, BookCreate, BookList, FriendCreate, FriendList, Header],
  imports: [BrowserModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
