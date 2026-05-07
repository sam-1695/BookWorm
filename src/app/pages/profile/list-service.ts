import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { BookList } from '../profile/list-interface';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private lists = new BehaviorSubject<BookList[]>([]);
  lists$ = this.lists.asObservable();

  constructor(private http: HttpClient) {}

  fetchLists(): void {
    this.http.get<any>('http://localhost:3000/api/lists').subscribe({
      next: (data) => {
        // Handle both direct array and wrapped array ({lists: []})
        const listsArray = Array.isArray(data) ? data : (data.lists || []);
        this.lists.next(listsArray);
      },
      error: (err) => {
        console.error('ListService: Error fetching lists', err);
      }
    });
  }
}
