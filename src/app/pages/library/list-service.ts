import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { BookList } from './list-interface';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private lists = new BehaviorSubject<BookList[]>([]);
  lists$ = this.lists.asObservable();

  constructor(private http: HttpClient) {}

  fetchLists(): void {
    this.http.get<BookList[]>('http://localhost:3000/api/lists').subscribe({
      next: (data) => {
        this.lists.next(data);
      },
      error: (err) => {
        console.error('Error fetching lists', err);
      }
    });
  }
}
