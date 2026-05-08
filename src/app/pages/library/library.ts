import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ListService } from '../profile/list-service';
import { BookList } from '../profile/list-interface';
import { AuthService, CurrentUser } from '../../services/auth.service';
import { Book } from '../../book/book-interface';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-library',
  standalone: false,
  templateUrl: './library.html',
  styleUrl: './library.css',
})
export class Library implements OnInit {
  currentUser: CurrentUser | null = null;

  lists$: Observable<BookList[]>;

  availableBooks: Book[] = [];

  showCreateListForm = false;

  newListName = '';
  selectedBookIds: string[] = [];

  selectedBookByListId: { [listId: string]: string } = {};

  message = '';
  errorMessage = '';

  // review state
  reviewingBookId: string | null = null;
  reviewRating: number = 0;
  reviewComment: string = '';
  // Map of bookId -> review, so we can quickly check if a book is already reviewed
  reviewedBookMap: { [bookId: string]: any } = {};

  private booksApiUrl = 'http://localhost:3000/api/books';

  constructor(
    private listService: ListService,
    private authService: AuthService,
    private reviewService: ReviewService,
    private router: Router,
    private http: HttpClient
  ) {
    this.lists$ = this.listService.lists$;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadBooks();
    this.loadUserLists();
  }

  loadUserLists(): void {
    if (!this.currentUser) {
      return;
    }

    this.listService.fetchListsByUser(this.currentUser._id);
  }

  loadBooks(): void {
    this.http.get<any[]>(this.booksApiUrl).subscribe({
      next: (booksFromApi) => {
        this.availableBooks = booksFromApi.map((book) => ({
          _id: book._id,
          id: book._id,
          title: book.title,
          author: book.author,
          coverPhoto: book.coverPhoto,
          description: book.description
        }));
      },
      error: (err) => {
        console.error('Error loading books:', err);
        this.errorMessage = 'Could not load books from the database.';
      }
    });
  }

  // Load the current user's reviews and build a bookId -> review map
  loadUserReviews(): void {
    if (!this.currentUser) return;
 
    this.reviewService.getReviewsByUser(this.currentUser._id).subscribe({
      next: (reviews) => {
        this.reviewedBookMap = {};
        reviews.forEach((review) => {
          const bookId = review.bookId?._id || review.bookId;
          if (bookId) {
            this.reviewedBookMap[bookId] = review;
          }
        });
      },
      error: (err) => console.error('Error loading user reviews:', err)
    });
  }

  toggleCreateListForm(): void {
    this.showCreateListForm = !this.showCreateListForm;
    this.message = '';
    this.errorMessage = '';
  }

  createList(): void {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const name = this.newListName.trim();

    if (!name) {
      this.errorMessage = 'Please enter a list name.';
      return;
    }

    this.listService.createList(
      this.currentUser._id,
      name,
      this.selectedBookIds
    ).subscribe({
      next: () => {
        this.message = 'List created!';
        this.errorMessage = '';
        this.newListName = '';
        this.selectedBookIds = [];
        this.showCreateListForm = false;

        // Reload from backend so the page stays synced with MongoDB
        this.loadUserLists();
      },
      error: (err) => {
        console.error('Error creating list:', err);
        this.errorMessage = 'Could not create the list.';
      }
    });
  }

  addBookToList(listId: string): void {
    const bookId = this.selectedBookByListId[listId];

    if (!bookId) {
      this.errorMessage = 'Please choose a book to add.';
      return;
    }

    this.listService.addBookToList(listId, bookId).subscribe({
      next: () => {
        this.message = 'Book added to list!';
        this.errorMessage = '';
        this.selectedBookByListId[listId] = '';

        // Reload from backend so populated book covers update immediately
        this.loadUserLists();
      },
      error: (err) => {
        console.error('Error adding book to list:', err);
        this.errorMessage = 'Could not add book to list.';
      }
    });
  }

  removeBookFromList(listId: string, bookId: string | undefined | null): void {
    if (!bookId) {
      return;
    }

    this.listService.removeBookFromList(listId, bookId).subscribe({
      next: () => {
        this.message = 'Book removed from list.';
        this.errorMessage = '';

        this.loadUserLists();
      },
      error: (err) => {
        console.error('Error removing book from list:', err);
        this.errorMessage = 'Could not remove book from list.';
      }
    });
  }

  deleteList(list: BookList): void {
    if (list.name.toLowerCase() === 'favorites') {
      this.errorMessage = 'The Favorites list cannot be deleted.';
      return;
    }

    this.listService.deleteList(list._id).subscribe({
      next: () => {
        this.message = 'List deleted.';
        this.errorMessage = '';

        this.loadUserLists();
      },
      error: (err) => {
        console.error('Error deleting list:', err);
        this.errorMessage = 'Could not delete list.';
      }
    });
  }



  // review methods
 
  openReviewForm(bookId: string): void {
    this.reviewingBookId = this.reviewingBookId === bookId ? null : bookId;
    this.reviewRating = 5;
    this.reviewComment = '';
    this.message = '';
    this.errorMessage = '';
  }
 
  submitReview(bookId: string): void {
    if (!this.currentUser) return;
 
    if (!this.reviewRating || this.reviewRating < 1 || this.reviewRating > 5) {
      this.errorMessage = 'Please enter a rating between 1 and 5.';
      return;
    }
 
    this.reviewService.createReview(
      this.currentUser._id,
      bookId,
      this.reviewRating,
      this.reviewComment
    ).subscribe({
      next: (newReview) => {
        this.message = 'Review submitted!';
        this.reviewingBookId = null;
        this.reviewRating = 5;
        this.reviewComment = '';
        this.reviewedBookMap[bookId] = newReview;
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        this.errorMessage = 'Could not submit review.';
      },
    });
  }
 
  cancelReview(): void {
    this.reviewingBookId = null;
    this.reviewRating = 5;
    this.reviewComment = '';
  }

  // Returns the existing review for a book, or null if not reviewed yet
  getExistingReview(bookId: string): any {
    return this.reviewedBookMap[bookId] || null;
  }
  



  // helper methods

  getBookId(book: Book): string {
    return book._id || book.id || '';
  }

  getListBookId(book: any): string {
    return book._id || book.id || '';
  }
}