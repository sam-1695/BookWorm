import { Book } from '../../book/book-interface';

export interface BookList {
    _id: string;
    userId: any;
    name: string;
    books: Book[];
    createdAt: string;
}
