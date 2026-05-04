import { Injectable } from '@angular/core';
import { Book } from './book-interface';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})

export class BookService {
  private books: Book[] = [];
  private bookUpdated = new Subject<Book[]>();

  constructor(private http: HttpClient) { }


  getPosts() {
    console.log('BookService: Fetching books from http://localhost:5000/api/books...');
    this.http.get<{ message: string; posts: any }>('http://localhost:5000/api/books')
      .pipe(map((bookData) => {
        console.log('BookService: Raw data received from API:', bookData);
        return bookData.posts.map((book: any) => {
          return {
            id: book._id,
            title: book.title,
            author: book.author,
            description: book.description
          };
        });
      }))
      .subscribe({
        next: (transformedBooks) => {
          console.log('BookService: Successfully transformed books:', transformedBooks);
          this.books = transformedBooks;
          console.log('BookService: Notifying subscribers with updated list.');
          this.bookUpdated.next([...this.books]);
        },
        error: (err) => {
          console.error('BookService: Error fetching posts:', err);
        }
      });
  }

  getPost(id: string) {
    return this.books.find(book => book.id === id);
  }

  addBook(title: string, author: string, description: string) {
    const book: Book = { id: null, title: title, author: author, description: description };
    return this.http.post<{ message: string, postId: string }>(
      'http://localhost:5000/api/books',
      book
    ).pipe(map((responseData) => {
      const postId = responseData.postId;
      this.books.push({ ...book, id: postId });
      this.bookUpdated.next([...this.books]);
    }));
  }

  // copilot did it 
  updateBook(id: string, title: string, author: string, description: string) {
    const updatedBook: Book = { id: id, title: title, author: author, description: description };
    return this.http.put(`http://localhost:5000/api/books/${id}`, updatedBook)
      .pipe(map(() => {
        const index = this.books.findIndex(book => book.id === id);
        if (index !== -1) {
          this.books[index] = updatedBook;
        } else {
          // If the book wasn't in the local list, we should probably refresh all
          this.getPosts();
        }
        this.bookUpdated.next([...this.books]);
      }));
  }

  deleteBook(bookId: string) {
    return this.http.delete(`http://localhost:5000/api/books/${bookId}`)
      .subscribe(() => {
        const updatedBooks = this.books.filter(book => book.id !== bookId);
        this.books = updatedBooks;
        this.bookUpdated.next([...this.books]);
      });
  }
  
  getBookUpdateListener() {
    return this.bookUpdated.asObservable();
  }
}
