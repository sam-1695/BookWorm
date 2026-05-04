import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Book } from '../book-interface';
import { BookService } from '../book-service';

@Component({
  selector: 'app-book-list',
  standalone: false,
  templateUrl: './book-list.html',
  styleUrl: './book-list.css',
})

export class BookList {
  books$!: Observable<Book[]>;

  constructor(private bookService: BookService) { }

  ngOnInit() {
    console.log('BookList: Component initialized. Monitoring books observable...');
    this.books$ = this.bookService.getBookUpdateListener();
    
    console.log('BookList: Triggering initial fetch from service.');
    this.bookService.getPosts();
  }

  onDelete(bookId: string) {
    this.bookService.deleteBook(bookId);
    this.bookService.getPosts();
  }
}
