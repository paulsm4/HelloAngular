import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, switchMap, distinctUntilChanged, startWith, share} from 'rxjs/operators';

import { BookService } from '../services/book.service';
import { Book } from '../model/book';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {

  /* tslint:disable no-inferrable-types */
  public searchString: string = '';
  public books$: Observable<Book[]>;
  private searchTerms: Subject<string> = new Subject();

  constructor(private bookService: BookService) { }

  ngOnInit() {
     this.books$ = this.searchTerms.pipe(
      startWith(this.searchString),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((query) =>
        this.bookService.getBooks(query)),
        share()
    );
  }

  search() {
    this.searchTerms.next(this.searchString);
  }

}
