// book-component.ts
import { Component, View, EventEmitter } from 'angular2/angular2';
import Book from '../models/book';

@Component({
  /* ... */
  outputs: ['rated'] // <-- output!
})
@View({
  /* ... */
})
export default class BookComponent {
  book: Book;
  rated: EventEmitter = new EventEmitter();;

  rateUp() {
    this.book.rating++;
    this.rated.next(this.book);
  }

  rateDown() {
    this.book.rating--;
    this.rated.next(this.book);
  }
}
