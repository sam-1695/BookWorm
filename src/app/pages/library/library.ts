import { Component, OnInit } from '@angular/core';
import { ListService } from './list-service';
import { Observable } from 'rxjs';
import { BookList } from './list-interface';

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
    { title: 'The Giver', author: 'Lois Lowry' },
    { title: 'Book Thief', author: 'Markus Zusak' },
    { title: '1984', author: 'George Orwell' },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien' },
  ];

  constructor(private listService: ListService) {
    this.lists$ = this.listService.lists$;
  }

  ngOnInit(): void {
    this.listService.fetchLists();
  }
}
