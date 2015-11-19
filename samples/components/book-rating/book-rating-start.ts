// book-rating.ts
import {Component, View} from 'angular2/angular2';

@Component({
  selector: 'book-rating'
})
@View({
  directives: [], // later: BookComponent, NgFor
  template: `
    <h1>Bücher</h1>
    <p>{{ books }}</p>
   `
})
export default class BookRating {
  books: Array<string>;

  constructor() {
    this.books = ['Angular 2', 'Aurelia'];
  }
}
