import { Component, OnInit } from '@angular/core';
import { BookService } from '../../book/book-service';
import { Book } from '../../book/book-interface';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-explore',
  standalone: false,
  templateUrl: './explore.html',
  styleUrl: './explore.css',
})
export class Explore implements OnInit {
  featuredBook: Book | null = null;
  editorsPicks$: Observable<Book[]>;
  newReleases$: Observable<Book[]>;
  trending$: Observable<Book[]>;

  constructor(private bookService: BookService) {
    const books$ = this.bookService.getBookUpdateListener();

    this.editorsPicks$ = books$.pipe(
      map(books => this.shuffle(books).slice(0, 5))
    );

    this.newReleases$ = books$.pipe(
      map(books => [...books].reverse().slice(0, 5))
    );

    this.trending$ = books$.pipe(
      map(books => this.shuffle(books).slice(0, 5))
    );
  }

  ngOnInit(): void {
    this.bookService.getPosts();
    this.bookService.getBookUpdateListener().subscribe(books => {
      if (books.length > 0 && !this.featuredBook) {
        this.featuredBook = books[0];
      }
    });
  }

  private shuffle(array: any[]) {
    return array.sort(() => Math.random() - 0.5);
  }
}
