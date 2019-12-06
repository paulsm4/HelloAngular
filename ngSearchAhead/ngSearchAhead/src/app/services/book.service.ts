import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Book } from '../model/book';

@Injectable()
export class BookService {

  constructor(private http: HttpClient) { }

  getBooks(query: string): Observable<Book[]> {
    const httpParams = new HttpParams().set('q', `${query}`);
    // return this.http.get<Book[]>('/api/book', { params: params });
    return this.http.get<Book[]>('/api/book', { params: httpParams} );
  }
}
