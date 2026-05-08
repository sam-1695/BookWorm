import { Injectable } from '@angular/core';
import { Book } from './book-interface';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})

export class BookService {
  private books: Book[] = [];
  private bookUpdated = new BehaviorSubject<Book[]>([]);

  constructor(private http: HttpClient) { }


  getPosts() {
    console.log('BookService: Fetching books from https://bookworm-backend-pl2t.onrender.com/api/books...');
    this.http.get<any>('https://bookworm-backend-pl2t.onrender.com/api/books')
      .pipe(map((bookData) => {
        console.log('BookService: Raw data received from API:', bookData);
        
        // Handle both direct array and wrapped array ({posts: []})
        const posts = Array.isArray(bookData) ? bookData : (bookData.posts || []);
        
        if (!Array.isArray(posts)) {
          console.error('BookService: API did not return an array. Received:', bookData);
          return [];
        }

        return posts.map((book: any) => {
          return {
            id: book._id,
            title: book.title,
            author: book.author,
            coverPhoto: book.coverPhoto,
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

  addBook(title: string, author: string, coverPhoto: string, description: string) {
    const book: Book = { id: null, title: title, author: author, coverPhoto: coverPhoto, description: description };
    return this.http.post<any>(
      'https://bookworm-backend-pl2t.onrender.com/api/books',
      book
    ).pipe(map((responseData) => {
      const postId = responseData._id;
      this.books.push({ ...book, id: postId });
      this.bookUpdated.next([...this.books]);
    }));
  }

  // copilot did it 
  updateBook(id: string, title: string, author: string, coverPhoto: string, description: string) {
    const updatedBook: Book = { id: id, title: title, author: author, coverPhoto: coverPhoto, description: description };
    return this.http.put(`https://bookworm-backend-pl2t.onrender.com/api/books/${id}`, updatedBook)
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
    return this.http.delete(`https://bookworm-backend-pl2t.onrender.com/api/books/${bookId}`)
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
