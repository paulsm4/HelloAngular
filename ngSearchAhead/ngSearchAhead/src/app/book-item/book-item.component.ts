import { Component, OnInit, Input } from '@angular/core';

import { Book } from '../model/book';
import { BookService } from '../services/book.service';

@Component({
  selector: 'app-book-item',
  templateUrl: './book-item.component.html',
  styleUrls: ['./book-item.component.css']
})
export class BookItemComponent implements OnInit {

  @Input()
  public book: Book;

  constructor(private bookService: BookService)  { }

  ngOnInit() {}

}
