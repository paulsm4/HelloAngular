import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { Contact } from '../models/Contact';
import { Note } from '../models/Note';


@Injectable({
  providedIn: 'root'
})
export class ContactsService {

  myAppUrl: string;
  myApiUrl: string;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8'
    })
  };

  constructor(private http: HttpClient) {
    //this.myAppUrl = environment.appUrl;
    this.myAppUrl = 'http://localhost:53561/';
    this.myApiUrl = 'api/Contacts/';
  }

  getContacts(): Observable<Contact[]> {
    const url = this.myAppUrl + this.myApiUrl;
    console.log('ContactsService.getContacts(): url=', url);
    return this.http.get<Contact[]>(url)
    .pipe(
      retry(1)
    );
  }
}
