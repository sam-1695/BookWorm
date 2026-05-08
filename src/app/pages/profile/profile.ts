import { Component, OnInit } from '@angular/core';
import { ListService } from './list-service';
import { Observable } from 'rxjs';
import { BookList } from './list-interface';
import { AuthService, CurrentUser } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Book } from '../../book/book-interface';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  lists$: Observable<BookList[]>;

  currentUser: CurrentUser | null = null;
  bioText: string = '';
  isEditingBio: boolean = false;
  saveMessage: string = '';

  availableBooks: Book[] = [];
  selectedRecentReadBookId: string = '';

  userReviews: any[] = [];

  private booksApiUrl = 'http://localhost:3000/api/books';

  constructor(
    private listService: ListService,
    private authService: AuthService,
    private userService: UserService,
    private reviewSource: ReviewService,
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

    this.bioText = this.currentUser.bio || '';

    // Prevent previous user's lists from flashing/showing
    this.listService.clearLists();

    // IMPORTANT: only fetch lists for the logged-in user
    this.listService.fetchListsByUser(this.currentUser._id);

    this.loadBooks();
    this.refreshCurrentUser();
    this.loadReviews();
  }

  refreshCurrentUser(): void {
    if (!this.currentUser) {
      return;
    }

    this.authService.refreshCurrentUser().subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.bioText = updatedUser.bio || '';
      },
      error: (err) => {
        console.error('Error refreshing current user:', err);
      }
    });
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
      }
    });
  }

  // reviews 
 
  loadReviews(): void {
    if (!this.currentUser) return;
 
    this.reviewSource.getReviewsByUser(this.currentUser._id).subscribe({
      next: (reviews) => { this.userReviews = reviews; },
      error: (err) => console.error('Error loading reviews:', err)
    });
  }
 
  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
 
  deleteReview(reviewId: string): void {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
 
    this.reviewSource.deleteReview(reviewId).subscribe({
      next: () => {
        this.userReviews = this.userReviews.filter((r) => r._id !== reviewId);
      },
      error: (err) => console.error('Error deleting review:', err)
    });
  }

  // bio

  startEditingBio(): void {
    this.isEditingBio = true;
    this.saveMessage = '';
  }

  cancelEditingBio(): void {
    this.bioText = this.currentUser?.bio || '';
    this.isEditingBio = false;
  }

  saveBio(): void {
    if (!this.currentUser) {
      return;
    }

    this.authService.updateUser(this.currentUser._id, {
      bio: this.bioText
    }).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.bioText = updatedUser.bio || '';
        this.isEditingBio = false;
        this.saveMessage = 'Bio saved!';
      },
      error: (err) => {
        console.error('Error saving bio:', err);
        this.saveMessage = 'Could not save bio.';
      }
    });
  }

  // profile photo

  onProfilePictureSelected(event: Event): void {
    if (!this.currentUser) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageBase64 = reader.result as string;

      this.authService.updateUser(this.currentUser!._id, {
        profilePicture: imageBase64
      }).subscribe({
        next: (updatedUser) => {
          this.currentUser = updatedUser;
          this.saveMessage = 'Profile picture updated!';
        },
        error: (err) => {
          console.error('Error saving profile picture:', err);
          this.saveMessage = 'Could not save profile picture.';
        }
      });
    };

    reader.readAsDataURL(file);
  }

  // recent reads

  addRecentRead(): void {
    if (!this.currentUser || !this.selectedRecentReadBookId) {
      return;
    }

    this.userService.addRecentRead(
      this.currentUser._id,
      this.selectedRecentReadBookId
    ).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.authService.saveUser(updatedUser);
        this.selectedRecentReadBookId = '';
        this.saveMessage = 'Recent read added!';
      },
      error: (err) => {
        console.error('Error adding recent read:', err);
        this.saveMessage = 'Could not add recent read.';
      }
    });
  }

  removeRecentRead(bookId: string): void {
    if (!this.currentUser || !bookId) {
      return;
    }

    this.userService.removeRecentRead(this.currentUser._id, bookId).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.authService.saveUser(updatedUser);
        this.saveMessage = 'Recent read removed.';
      },
      error: (err) => {
        console.error('Error removing recent read:', err);
        this.saveMessage = 'Could not remove recent read.';
      }
    });
  }

  // helpers

  getBookId(book: any): string {
    return book._id || book.id || '';
  }

  getRecentReads(): any[] {
    return this.currentUser?.recentReads || [];
  }
}