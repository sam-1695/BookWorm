import { Component, OnInit } from '@angular/core';
import { ListService } from '../profile/list-service';
import { Observable } from 'rxjs';
import { BookList } from '../profile/list-interface';

@Component({
  selector: 'app-library',
  standalone: false,
  templateUrl: './library.html',
  styleUrl: './library.css',
})
export class Library implements OnInit {
  lists$: Observable<BookList[]>;
  mockFriends = [
    { username: 'Alice', avatar: 'https://i.pravatar.cc/150?u=alice' },
    { username: 'Bob', avatar: 'https://i.pravatar.cc/150?u=bob' },
    { username: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=charlie' },
    { username: 'David', avatar: 'https://i.pravatar.cc/150?u=david' },
    { username: 'Eve', avatar: 'https://i.pravatar.cc/150?u=eve' },
  ];
  mockRecentReads = [
    { title: 'The Giver', author: 'Lois Lowry', coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1342493368i/3636.jpg' },
    { title: 'Book Thief', author: 'Markus Zusak', coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1522157426i/18031.jpg' },
    { title: '1984', author: 'George Orwell', coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1532714506i/40961427.jpg' },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg' },
  ];

  constructor(private listService: ListService) {
    this.lists$ = this.listService.lists$;
  }

  ngOnInit(): void {
    this.listService.fetchLists();
  }
}
