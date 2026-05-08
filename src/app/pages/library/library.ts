import { Component, OnInit } from '@angular/core';
import { ListService } from './list-service';
import { Observable } from 'rxjs';
import { BookList } from './list-interface';
import { BookService } from '../../book/book-service';
import { Book } from '../../book/book-interface';

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

  constructor(private listService: ListService, private bookService: BookService) {
    this.lists$ = this.listService.lists$;
  }

  ngOnInit(): void {
    // We assume the user is logged in. In a real app, get user ID from AuthService.
    const userId = localStorage.getItem('userId') || 'mock-user-id';
    this.listService.fetchListsByUser(userId);

    this.bookService.getPosts();
    this.bookService.getBookUpdateListener().subscribe((books: Book[]) => {
      this.availableBooks = books;
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

  getBookId(book: any): string {
    return book._id || book.id || '';
  }

  getListBookId(book: any): string {
    return book._id || book.id || '';
  }
}