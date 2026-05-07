import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) {}

  // Get all users (used for the search/add-friend feature)
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Get a single user by ID (used to refresh friends + pending requests)
  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // PUT /api/users/:receiverId/friend-request  |  body: { senderId }
  sendFriendRequest(receiverId: string, senderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${receiverId}/friend-request`, { senderId });
  }

  // PUT /api/users/:receiverId/accept-friend   |  body: { senderId }
  acceptFriendRequest(receiverId: string, senderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${receiverId}/accept-friend`, { senderId });
  }

  // PUT /api/users/:userId/remove-friend       |  body: { friendId }
  removeFriend(userId: string, friendId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/remove-friend`, { friendId });
  }
}