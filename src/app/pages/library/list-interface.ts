export interface ListBook {
  _id?: string;
  id?: string | null;
  title: string;
  author: string;
  coverPhoto?: string;
  description?: string;
}

export interface BookList {
  _id: string;
  userId: any;
  name: string;
  books: ListBook[];
  createdAt?: string;
  updatedAt?: string;
}