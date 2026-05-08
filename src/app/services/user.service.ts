import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // ANGULAR SERVICE & OBSERVABLE
  // angular service with observable-based HTTP calls for user/friend operations
  sendFriendRequest(receiverId: string, senderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${receiverId}/friend-request`, { senderId });
  }

  acceptFriendRequest(receiverId: string, senderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${receiverId}/accept-friend`, { senderId });
  }

  declineFriendRequest(receiverId: string, senderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${receiverId}/decline-friend`, { senderId });
  }

  removeFriend(userId: string, friendId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/remove-friend`, { friendId });
  }

  addRecentRead(userId: string, bookId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/recent-reads`, { bookId });
  }

  removeRecentRead(userId: string, bookId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/recent-reads/remove`, { bookId });
  }
}