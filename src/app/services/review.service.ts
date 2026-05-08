import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = 'http://localhost:3000/api/reviews';

  constructor(private http: HttpClient) {}

  getReviewsByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  getReviewsByBook(bookId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/book/${bookId}`);
  }

  createReview(userId: string, bookId: string, rating: number, comment: string): Observable<any> {
    return this.http.post(this.apiUrl, { userId, bookId, rating, comment });
  }

  updateReview(reviewId: string, rating: number, comment: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reviewId}`, { rating, comment });
  }

  deleteReview(reviewId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reviewId}`);
  }
}