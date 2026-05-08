// INTERFACES & TYPE USAGE
// defines Book data type
export interface Book {
  _id?: string;
  id?: string | null;
  title: string;
  author: string;
  coverPhoto?: string;
  description: string;
}