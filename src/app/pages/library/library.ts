import { Component, OnInit } from '@angular/core';
import { ListService } from './list-service';
import { Observable } from 'rxjs';
import { BookList } from './list-interface';
import { BookService } from '../../book/book-service';
import { Book } from '../../book/book-interface';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
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

  // Review state
  reviewingBookId: string | null = null;
  reviewRating: number = 0;
  reviewComment: string = '';
  reviewedBookMap: { [bookId: string]: any } = {};

  currentUser: any = null;

  private booksApiUrl = 'https://bookworm-backend-pl2t.onrender.com/api/books';

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
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.listService.clearLists();

    this.loadBooks();
    this.loadUserLists();
    this.loadUserReviews();
  }

  loadBooks(): void {
    this.http.get<Book[]>(this.booksApiUrl).subscribe({
      next: (booksFromApi) => {
        this.availableBooks = booksFromApi;
      },
      error: (err) => {
        console.error('Error loading books:', err);
        this.errorMessage = 'Could not load books.';
      }
    });
  }

  loadUserLists(): void {
    if (!this.currentUser) {
      return;
    }

    this.listService.fetchListsByUser(this.currentUser._id);
  }

  // Load the current user's reviews and build a bookId -> review map
  loadUserReviews(): void {
    if (!this.currentUser) {
      return;
    }

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
      error: (err) => {
        console.error('Error loading user reviews:', err);
      }
    });
  }

  toggleCreateListForm(): void {
    this.showCreateListForm = !this.showCreateListForm;
    this.message = '';
    this.errorMessage = '';
    this.selectedBookIds = [];
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
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.newListName.trim()) {
      this.errorMessage = 'Please enter a list name.';
      return;
    }

    this.listService.createList(
      this.currentUser._id,
      this.newListName,
      this.selectedBookIds
    ).subscribe({
      next: () => {
        this.message = 'List created successfully!';
        this.errorMessage = '';
        this.newListName = '';
        this.selectedBookIds = [];
        this.showCreateListForm = false;

        this.loadUserLists();
      },
      error: (err) => {
        this.errorMessage = 'Failed to create list.';
        console.error('Error creating list:', err);
      }
    });
  }

  deleteList(list: BookList): void {
    if (confirm(`Are you sure you want to delete the list "${list.name}"?`)) {
      this.listService.deleteList(list._id).subscribe({
        next: () => {
          this.message = 'List deleted.';
          this.errorMessage = '';
        },
        error: (err) => {
          console.error('Error deleting list:', err);
          this.errorMessage = 'Could not delete list.';
        }
      });
    }
  }

  removeBookFromList(listId: string, bookId: string): void {
    this.listService.removeBookFromList(listId, bookId).subscribe({
      next: () => {
        this.message = 'Book removed from list.';
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Error removing book from list:', err);
        this.errorMessage = 'Could not remove book from list.';
      }
    });
  }

  // Suggestion Gallery Helpers
  toggleAdd(listId: string): void {
    this.isAdding[listId] = !this.isAdding[listId];
  }

  getSuggestions(list: BookList): Book[] {
    const listBookIds = list.books.map((book) => this.getBookId(book));

    return this.availableBooks
      .filter((book) => !listBookIds.includes(this.getBookId(book)))
      .slice(0, 8);
  }

  addSuggestionToList(listId: string, bookId: string): void {
    this.listService.addBookToList(listId, bookId).subscribe({
      next: () => {
        this.message = 'Book added to list.';
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Error adding book to list:', err);
        this.errorMessage = 'Could not add book to list.';
      }
    });
  }

  // Review methods
  openReviewForm(bookId: string): void {
    this.reviewingBookId = this.reviewingBookId === bookId ? null : bookId;
    this.reviewRating = 5;
    this.reviewComment = '';
    this.message = '';
    this.errorMessage = '';
  }

  submitReview(bookId: string): void {
    if (!this.currentUser) {
      return;
    }

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
        this.errorMessage = '';
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

  // Helper methods
  getBookId(book: any): string {
    return book._id || book.id || '';
  }

  getListBookId(book: any): string {
    return book._id || book.id || '';
  }
}