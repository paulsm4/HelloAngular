* Unit testing Angular service with HttpClient, Sergey Kryvets
    https://skryvets.com/blog/2018/02/18/unit-testing-angular-service-with-httpclient/
	https://codecraft.tv/courses/angular/unit-testing/asynchronous/#_jasmines_code_done_code_function

1. Create project outline:
  - cd $PROJ/HelloAngular/{dotnetcore-angular8/Blog/ClientApp AngularQuickstart/quickstart
    del /s/q node_modules

  - cd $PROJ/
    mv HelloAngular HelloAngular.bu
    git clone https://github.com/paulsm4/HelloAngular.git
    WinDiff > HelloAngular.bu HelloAngular
    <= Copied ngSearchAhead and Blog-tutorial-Angular-8-.NET-Core-2.2-CRUD-master.zip

  - cd cd $PROJ/HelloAngular
    ng new TestHttpClient
      <= Add routing= Y, CSS

  - cd C:\paul\proj\HelloAngular\TestHttpClient
    code .
    <= Start VSCode

2. Create model classes and unit test:
   - ng generate class models/Contact
CREATE src/app/models/contact.spec.ts (146 bytes)
CREATE src/app/models/contact.ts (22 bytes)

   - models/contact.ts =>
export class Contact {
  ContactId?: number;
  Name: string;
  EMail: string;
  Phone1: string;
  Phone2: string;
  Address1: string;
  Address2: string;
  City: string;
  State: string;
  Zip: string;
}

  - ng generate class models/Note
CREATE src/app/models/note.spec.ts (146 bytes)
CREATE src/app/models/note.ts (22 bytes)

 - models/note.ts =>
export class Note {
  NoteId?: number;
  Text: string;
  Date: Date;
  ContactId?: number;
}

  - ng g service services/Contacts
    ...

  -  environments/environment.ts =>
 export const environment = {
  production: false,
  appUrl: 'http://localhost:53561/'
};

  - services/contacts.ts =>
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

3. Tried running HttpClient from the unit tests (services/contacts.service.spec.ts)
  <= NO-GO
  - ng test
7 specs, 1 failure, randomized with seed 86529
Spec List | Failures
ContactsService > should retrieve all contacts
Error: Timeout - Async callback was not invoked within 20000ms (set by jasmine.DEFAULT_TIMEOUT_INTERVAL)
Error: Timeout - Async callback was not invoked within 20000ms (set by jasmine.DEFAULT_TIMEOUT_INTERVAL)
  <= Let's try to circle back and get HttpClient working from Jasmine later...

4. Plan B: Create an Angular test page to invoke REST API/test service:
   - ng g component TestRestAPI/TestRestAPI
C:\paul\proj\HelloAngular\TestHttpClient>ng g component TestRestAPI/TestRestAPI
CREATE src/app/TestRestAPI/test-rest-api/test-rest-api.component.html (28 bytes)
CREATE src/app/TestRestAPI/test-rest-api/test-rest-api.component.spec.ts (665 bytes)
CREATE src/app/TestRestAPI/test-rest-api/test-rest-api.component.ts (295 bytes)
CREATE src/app/TestRestAPI/test-rest-api/test-rest-api.component.css (0 bytes)

   - app-routing.module.ts =>
...
const routes: Routes = [
  { path: '', component: TestRestAPIComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

   - test-rest-api/test-rest-api.component.html =>
<h1>Test ContactsApp REST API</h1>
<hr/>
<div>
  <p>REST URL: {{restUrl}}</p>
    <ul>
        <li *ngFor="let contact of contacts">{{contact.Name}} {{contact.EMail}}</li>
    </ul>
</div>

   - test-rest-api/test-rest-api.component.ts =>
import { Component, OnInit } from '@angular/core';
import { ContactsService } from 'src/app/services/contacts.service';
import { Contact } from 'src/app/models/Contact';
import { Note } from 'src/app/models/Note';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-test-rest-api',
  templateUrl: './test-rest-api.component.html',
  styleUrls: ['./test-rest-api.component.css']
})
export class TestRestAPIComponent implements OnInit {
  restUrl: string;
  contacts: Contact[];

  constructor(private contactsService: ContactsService) {
    this.restUrl = ' http://localhost:53561/api/Contacts/';
   }

  ngOnInit() {
    this.contactsService.getContacts()
      .pipe(first())
      .subscribe(contacts => {
        this.contacts = contacts;
    });
  }
}

  - ng serve
    <= OK

  - MSVS > Debugger > Add Configuration > Chrome >
      <= Change url => "http://localhost:4200"

  - Debugger > Run >
      Chrome > http://localhost:4200 =>
Error: Uncaught (in promise): NullInjectorError: StaticInjectorError(AppModule)[HttpClient]
    <= We forgot to update AppModule?

  - app.module.ts =>

  - Debugger > Run >
ContactsService.getContacts(): url= http://localhost:53561/api/Contacts/
Failed to load resource: net::ERR_CONNECTION_REFUSED [http://localhost:53561/api/Contacts/]
Failed to load resource: net::ERR_CONNECTION_REFUSED [http://localhost:53561/api/Contacts/]
ERROR
core.js:6014
HttpErrorResponse {headers: HttpHeaders, status: 0, statusText: "Unknown Error", url: "http://localhost:53561/api/Contacts/", ok: false, …}
  <= Much better!

  - TBD:
    - Get rid of Angular boilerplate from "main"
    - Re-add test handler
    - Re-test with REST service enabled and sample contacts available

