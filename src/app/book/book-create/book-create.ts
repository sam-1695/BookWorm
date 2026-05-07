import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BookService } from '../book-service';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-book-create',
  standalone: false,
  templateUrl: './book-create.html',
  styleUrl: './book-create.css',
})

export class BookCreate {
  enterTitle = '';
  enterAuthor = '';
  enterCoverPhoto = '';
  enterDescription = '';
  mode: 'create' | 'edit' = 'create';

  postId: string | null = null;
  post: any;
  private postsSub: any;

  constructor(
    private bookService: BookService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        const foundPost = this.bookService.getPost(this.postId!);

        if (!foundPost) {
          this.bookService.getPosts();
          this.postsSub = this.bookService.getBookUpdateListener().subscribe(() => {
            const loadedPost = this.bookService.getPost(this.postId!);
            if (loadedPost) {
              this.post = loadedPost;
              this.enterTitle = this.post.title;
              this.enterAuthor = this.post.author;
              this.enterCoverPhoto = this.post.coverPhoto || '';
              this.enterDescription = this.post.description;
            }
          });
        } else {
          this.post = foundPost;
          this.enterTitle = this.post.title;
          this.enterAuthor = this.post.author;
          this.enterCoverPhoto = this.post.coverPhoto || '';
          this.enterDescription = this.post.description;
        }
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onAddBook(form: NgForm) {
    if (form.invalid) {
      return;
    }

    if (this.mode === 'create') {
      this.bookService.addBook(form.value.title, form.value.author, form.value.coverPhoto, form.value.description)
        .subscribe(() => {
          this.router.navigate(['/library']);
        });
    } else {
      this.bookService.updateBook(this.postId!, form.value.title, form.value.author, form.value.coverPhoto, form.value.description)
        .subscribe(() => {
          this.router.navigate(['/library']);
        });
    }
    form.resetForm();
  }

  ngOnDestroy(): void {
    this.postsSub?.unsubscribe();
  }
}
