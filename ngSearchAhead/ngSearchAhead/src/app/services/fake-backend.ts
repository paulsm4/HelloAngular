import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import { Book } from '../model/book';

/*
 * PURPOSE: Self-contained "mock" REST service
 *
 * USAGE:
 * - Implement HttpInterceptor (this module)
 * - Register "fakeBackendProvider" in providers[] section of app.module.ts
 *
 * REFERENCE:
 * Angular 7 - JWT Authentication Example, Jason Watmore
 * http://jasonwatmore.com/post/2018/11/16/angular-7-jwt-authentication-example-tutorial
 */
@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('FakeBackendInterceptor::intercept', request);

    // Mock database
    const books: Book[] = [
      { title: 'Song of Fire and Ice', author: 'George R. R. Martin', published: new Date(1996, 1, 1), genre: 'Fantasy' },
      { title: 'The Shining', author: 'Stephen King', published: new Date(1977, 1, 1), genre: 'Horror' },
      { title: 'Cujo', author: 'Stephen King', published: new Date(1981, 1, 1), genre: 'Horror' },
      { title: 'Dr. Sleep', author: 'Stephen King', published: new Date(2013, 1, 1), genre: 'Horror' },
      { title: 'Hunt for Red October', author: 'Tom Clancy', published: new Date(1984, 1, 1), genre: 'Thriller' },
      { title: 'Patriot Games', author: 'Tom Clancy', published: new Date(1987, 1, 1), genre: 'Thriller' },
      { title: 'As You Like It', author: 'William Shakespeare', published: new Date(1623, 1, 1), genre: 'Comedy' },
      { title: 'Hamlet', author: 'William Shakespeare', published: new Date(1603, 1, 1), genre: 'Drama' }
    ];

    // Perform requested query
    const sQuery = request.params.get('q');  // NO-GO: URL= "/api/book?q=C", equest.params.get('q')= null
    let result: Book[] = null;
    if (!sQuery || sQuery === '' ) {
      // Empty or null query string: return entire list
      result = books;
    } else {
      // Search for any title containing string
      result = [];
      for (let $i = 0; $i < books.length; $i++) {
          if (books[$i].title.includes(sQuery)) {
            result.push(books[$i]);
          }
      }
    }

    // wrap in delayed observable to simulate server api call
    return of(null).pipe(mergeMap(() => {
      return ok(result);
    }))

    // call materialize and dematerialize to ensure delay even if an error is thrown
    // REFERENCE: https://github.com/Reactive-Extensions/RxJS/issues/648
    .pipe(materialize())
    .pipe(delay(500))
    .pipe(dematerialize());

    // private helper functions
    function ok(body) {
      console.log('FakeBackendInterceptor::ok', body);
      return of(new HttpResponse({ status: 200, body }));
    }

    function unauthorized() {
      console.log('FakeBackendInterceptor::unauthorized');
      return throwError({ status: 401, error: { message: 'Unauthorized' } });
    }

    function error(message) {
      console.log('FakeBackendInterceptor::error', message);
      return throwError({ status: 400, error: { message } });
    }
  }
}

// To use mock service, register "fakeBackendProvider" in providers[] section of app.module.ts
export let fakeBackendProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
