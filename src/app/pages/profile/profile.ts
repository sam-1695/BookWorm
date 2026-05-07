import { Component, OnInit } from '@angular/core';
import { ListService } from './list-service';
import { Observable } from 'rxjs';
import { BookList } from './list-interface';
import { AuthService, CurrentUser } from '../../services/auth.service';
import { Router } from '@angular/router';

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

  mockFriends = [
    { username: 'Alice', avatar: 'https://i.pravatar.cc/150?u=alice' },
    { username: 'Bob', avatar: 'https://i.pravatar.cc/150?u=bob' },
    { username: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=charlie' },
    { username: 'David', avatar: 'https://i.pravatar.cc/150?u=david' },
    { username: 'Eve', avatar: 'https://i.pravatar.cc/150?u=eve' },
  ];

  mockRecentReads = [
    { title: 'The Giver', author: 'Lois Lowry', coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1342493368i/3636.jpg' },
    { title: 'Book Thief', author: 'Markus Zusak', coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1522157426i/18031.jpg' },
    { title: '1984', author: 'George Orwell', coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1532714506i/40961427.jpg' },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg' },
  ];

  constructor(
    private listService: ListService,
    private authService: AuthService,
    private router: Router
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
    this.listService.fetchLists();
  }

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
}