// book-rating.ts
import {Component, View, NgFor} from 'angular2/angular2';
import Book from '../models/book';
import BookComponent from './book-component';

@Component({
  selector: 'book-rating'
})
@View({
  directives: [BookComponent, NgFor],
  template: `
     <!-- ... -->
     <book ... (rated)="reorderBooks(book)"></book>
   `
})
export default class BookRating {
  books: Array<Book>;

  /* ... */

  reorderBooks(book: Book) {
    this.books.sort((a, b) => b.rating - a.rating);
  }
}
