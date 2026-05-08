import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BookList } from './list-interface';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private apiUrl = 'http://localhost:3000/api/lists';

  private lists = new BehaviorSubject<BookList[]>([]);
  lists$ = this.lists.asObservable();

  constructor(private http: HttpClient) {}

  clearLists(): void {
    this.lists.next([]);
  }

  fetchLists(): void {
    this.http.get<BookList[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.lists.next(data);
      },
      error: (err) => {
        console.error('ListService: Error fetching lists', err);
      }
    });
  }

  fetchListsByUser(userId: string): void {
    this.http.get<BookList[]>(`${this.apiUrl}/user/${userId}`).subscribe({
      next: (data) => {
        this.lists.next(data);
      },
      error: (err) => {
        console.error('ListService: Error fetching user lists', err);
      }
    });
  }

  createList(userId: string, name: string, bookIds: string[]): Observable<BookList> {
    return this.http.post<BookList>(this.apiUrl, {
      userId,
      name,
      books: bookIds
    }).pipe(
      tap((newList) => {
        const currentLists = this.lists.value;
        this.lists.next([...currentLists, newList]);
      })
    );
  }

  addBookToList(listId: string, bookId: string): Observable<BookList> {
    return this.http.put<BookList>(`${this.apiUrl}/${listId}/add-book`, {
      bookId
    }).pipe(
      tap((updatedList) => {
        const updatedLists = this.lists.value.map((list) =>
          list._id === updatedList._id ? updatedList : list
        );

        this.lists.next(updatedLists);
      })
    );
  }

  removeBookFromList(listId: string, bookId: string): Observable<BookList> {
    return this.http.put<BookList>(`${this.apiUrl}/${listId}/remove-book`, {
      bookId
    }).pipe(
      tap((updatedList) => {
        const updatedLists = this.lists.value.map((list) =>
          list._id === updatedList._id ? updatedList : list
        );

        this.lists.next(updatedLists);
      })
    );
  }

  deleteList(listId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${listId}`).pipe(
      tap(() => {
        const updatedLists = this.lists.value.filter((list) => list._id !== listId);
        this.lists.next(updatedLists);
      })
    );
  }
}