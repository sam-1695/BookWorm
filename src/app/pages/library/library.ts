import { Component, OnInit } from '@angular/core';
import { ListService } from './list-service';
import { Observable } from 'rxjs';
import { BookList } from './list-interface';
import { BookService } from '../../book/book-service';
import { Book } from '../../book/book-interface';
import { ReviewService } from '../../services/review.service';
import { AuthService, CurrentUser } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-library',
  standalone: false,
  templateUrl: './library.html',
  styleUrl: './library.css',
})
export class Library implements OnInit {
  lists$: Observable<BookList[]>;
  availableBooks: Book[] = [];
  
  newListName: string = '';
  selectedBookIds: string[] = [];
showCreateListForm: boolean = false;
  message: string = '';
  errorMessage: string = '';

  // Track which lists are in "Add Book" mode
  isAdding: { [listId: string]: boolean } = {};
  selectedBookByListId: { [listId: string]: string } = {};

  // review state
  reviewingBookId: string | null = null;
  reviewRating: number = 0;
  reviewComment: string = '';
  reviewedBookMap: { [bookId: string]: any } = {};
  currentUser: any = null; ///////////////////////////////////

  private booksApiUrl = 'http://localhost:3000/api/books';

  constructor(
    private listService: ListService,
    private bookService: BookService,
    private authService: AuthService,
    private reviewService: ReviewService,
    private router: Router,
    private http: HttpClient
  ) {
    this.lists$ = this.listService.lists$;
  }

  ngOnInit(): void {
    // We assume the user is logged in. In a real app, get user ID from AuthService.
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');//////////////////////
    const userId = localStorage.getItem('userId') || 'mock-user-id';
    this.listService.fetchListsByUser(userId);

    this.bookService.getPosts();
    this.bookService.getBookUpdateListener().subscribe((books: Book[]) => {
      this.availableBooks = books;
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
    this.selectedBookIds = []; // Clear selection when toggling
  }

  toggleBookSelection(bookId: string): void {
    const index = this.selectedBookIds.indexOf(bookId);
    if (index > -1) {
      this.selectedBookIds.splice(index, 1);
    } else {
      this.selectedBookIds.push(bookId);
    }
  }

  isBookSelected(bookId: string): boolean {
    return this.selectedBookIds.includes(bookId);
  }

  createList(): void {
    if (!this.newListName.trim()) {
      this.errorMessage = 'Please enter a list name.';
      return;
    }

    const userId = localStorage.getItem('userId') || 'mock-user-id';
    this.listService.createList(userId, this.newListName, this.selectedBookIds).subscribe({
      next: () => {
        this.message = 'List created successfully!';
        this.newListName = '';
        this.selectedBookIds = [];
        this.showCreateListForm = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to create list.';
        console.error(err);
      }
    });
  }

  deleteList(list: BookList): void {
    if (confirm(`Are you sure you want to delete the list "${list.name}"?`)) {
      this.listService.deleteList(list._id).subscribe();
    }
  }

  removeBookFromList(listId: string, bookId: string): void {
    this.listService.removeBookFromList(listId, bookId).subscribe();
  }

  // Suggestion Gallery Helpers
  toggleAdd(listId: string): void {
    this.isAdding[listId] = !this.isAdding[listId];
  }

  getSuggestions(list: BookList): Book[] {
    const listBookIds = list.books.map(b => this.getBookId(b));
    return this.availableBooks.filter(b => !listBookIds.includes(this.getBookId(b))).slice(0, 8);
  }

  addSuggestionToList(listId: string, bookId: string): void {
    this.listService.addBookToList(listId, bookId).subscribe();
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

  getExistingReview(bookId: string): any {
    return this.reviewedBookMap[bookId] || null;
  }

  // helper methods

  getBookId(book: any): string {
    return book._id || book.id || '';
  }

  getListBookId(book: any): string {
    return book._id || book.id || '';
  }
}
