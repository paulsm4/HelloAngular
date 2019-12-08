* Original intent: explore options for "testing" Angular app during code development

  - Unit testing Angular service with HttpClient, Sergey Kryvets
      https://skryvets.com/blog/2018/02/18/unit-testing-angular-service-with-httpclient/
	    https://codecraft.tv/courses/angular/unit-testing/asynchronous/#_jasmines_code_done_code_function

1. Create project outline:
  - cd $PROJ/HelloAngular/{dotnetcore-angular8/Blog/ClientApp AngularQuickstart/quickstart}
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

- Tried several more iterations, including SO question:
https://stackoverflow.com/questions/59204306/debug-angular-service-against-live-rest-api-nothing-happens
    <= Suggested Jasmine "done()"

===================================================================================================

* Plan B: Create an Angular test page to invoke REST API/test service:

1. New "TestRestAPI" Angular component:
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

2. Cleaned up test page, tested against service:
  - app.component.html
    <= Deleted boilerplate junk from start page

  - contacts.service.ts:
    <= Added error handler
      export class ContactsService {
        ...
        getContacts(): Observable<Contact[]> {
          const url = this.myAppUrl + this.myApiUrl;
          console.log('ContactsService.getContacts(): url=', url);
          return this.http.get<Contact[]>(url)
            .pipe(
              retry(1),
              catchError(this.errorHandler)
            );
        ...
        errorHandler(error) {
          let errorMessage = '';
          if (error.error instanceof ErrorEvent) {
            // Get client-side error
            errorMessage = error.error.message;
          } else {
            // Get server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }
          console.error(errorMessage);
          return throwError(errorMessage);
        }
        ...

  - ng serve => OK
    VSCode > Debugger >
      - "Angular clutter" removed (OK)
      - console:
ContactsService.getContacts(): url= http://localhost:53561/api/Contacts/
client:52 [WDS] Live Reloading enabled.
Failed to load resource: net::ERR_CONNECTION_REFUSED [http://localhost:53561/api/Contacts/]
Message: Http failure response for http://localhost:53561/api/Contacts/: 0 Unknown Error
  <= Perfect!

    - Started MSVS/REST; refreshed Angular:
Access to XMLHttpRequest at 'http://localhost:53561/api/Contacts/' from origin 'http://localhost:4200' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
  <= Hmmm... I wonder if maybe CORS was the problem above???

- Tried many things, stuck in Mobius Loop, basic problem still CORS:
Access to XMLHttpRequest at 'http://localhost:53561/api/Contacts/' from origin 'http://localhost:4200' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.

   - Links:
https://stackoverflow.com/a/59214622/3135317
https://docs.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-3.1
https://stackoverflow.com/questions/35553500/xmlhttprequest-cannot-load-xxx-no-access-control-allow-origin-header
https://stackoverflow.com/questions/47345282/how-to-add-cors-request-in-header-in-angular-5
https://stackoverflow.com/questions/53258297/access-to-xmlhttprequest-has-been-blocked-by-cors-policy
  <= Nothing helped,including a) ensuring CORS enabled n .Net Core "Startup.cs", disabling CORS in Chrome, etc etc...

  - $PROJ\HelloAngular\dotnetcore-angular8\Blog\Startup.cs:
      public class Startup {
        ...
        public void ConfigureServices(IServiceCollection services) {
          ...
          services.AddCors(options => {
            options.AddPolicy("CorsPolicy",
              builder => builder.AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader()
            );
          });
        ...
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
          ...
          app.UseCors("CorsPolicy");
        
===================================================================================================

* Plan C:
1. Changed TestHttpClient from "Contacts" to "Blog"
  <= Reverted to *WORKING* example...

  - MSVS/.Net Core REST API: C:\paul\proj\HelloAngular\dotnetcore-angular8\Blog
    <= Can run concurrently with MSVS (client= https://localhost:44330/) and ng serve (client= http://localhost:4200)

    - $PROJ\HelloAngular\dotnetcore-angular8\Blog\ClientApp\src\environments\environments.ts:
        appUrl: 'https://localhost:44330/' // MSVS 2019/IIS Express
        <= Q: So how exactly does client running on localhost:4200 successfully talk to REST service on localhost:44330???

  - Recapitulated "Blog" example in TestHttpClient:
    - cd C:\paul\proj\HelloAngular\dotnetcore-angular8\Blog\ClientApp
      code .
      DELETED: models/{Contact, Note}.ts; SUBSTITUTED: models/blog-post.ts
      DELETED: services/contact.service.cs; SUBSTITUTED: services/blog-post.service.ts
      MODIFIED: TestRestAPI/test-rest-api{.html, .ts}

  - Compared Angular in original "Blog/ClientApp" example vs. new "TestHttpClient" example:
    - ng serve (MSVS ClientApp project):
      <= http://localhost:4200/

    - Chrome > http://localhost:4200/ >
      <= OK: SUCCESSFUL
      - F12 (Dev tools) > Network >
        - Request URL: https://localhost:44330/api/BlogPosts/
        - Response Headers:
            access-control-allow-origin: *
            content-length: 95
            content-type: application/json; charset=utf-8
            date: Fri, 06 Dec 2019 21:10:44 GMT
            server: Microsoft-IIS/10.0
            status: 200
            x-powered-by: ASP.NET
            :authority: localhost:44330
            :method: GET
            :path: /api/BlogPosts/
            :scheme: https
            accept: application/json, text/plain, */*
            accept-encoding: gzip, deflate, br
            accept-language: en-US,en;q=0.9
            origin: http://localhost:4200
            referer: http://localhost:4200/
            sec-fetch-mode: cors
            sec-fetch-site: cross-site
            user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36
            <= Note the "https"!!!!!!

  - Changed TestHttpClient to use "HTTPS" (vs. "HTTP")
    <= Voila!  Component now WORKS!

2. Now that "TestRestApi" component is working, let's revisit "blog-post.service.spec.ts" unit test:
   - Unit tests: 7 specs, 3 failures:
     - AppComponent > should render title
TypeError: Cannot read property 'textContent' of null

     - TestRestAPIComponent > should create
Failed: Template parse errors:
Can't bind to 'routerLink' since it isn't a known property of 'a'. ("

     - BlogPostService > should retrieve blog posts
Error: Timeout - Async callback was not invoked within 5000ms (set by jasmine.DEFAULT_TIMEOUT_INTERVAL)
Error: Timeout - Async callback was not invoked within 5000ms (set by jasmine.DEFAULT_TIMEOUT_INTERVAL)
       <= This is the same as we got above, before we went to  "Plan B" ("component" vs. "Jasmine test")

3. Tried cleaning up unit test errors:
   - AppComponent > should render title
    <= Deleted bogus test from copy/paste: OK

    - TestRestAPIComponent > should create
      - Deleted "<a [routerLink]="['/add']" class="btn btn-primary float-right mb-3">New post</a>" from .html
      - NEXT ERROR:
NullInjectorError: StaticInjectorError(DynamicTestModule)[HttpClient]:
  StaticInjectorError(Platform: core)[HttpClient]:
    NullInjectorError: No provider for HttpClient!
error properties: Object({ ngTempTokenPath: null, ngTokenPath: [ Function ], ngDebugContext: DebugContext_({ view: Object({ def: Object({ factory: Function, nodeFlags: 33669121, rootNodeFlags: 33554433, nodeMatchedQueries: 0, flags: 0, nodes: [ Object({ nodeIndex: 0, parent: null, renderParent: null, bindingIndex: 0, outputIndex: 0, checkIndex: 0, flags: 33554433, childFlags: 114688, directChildFlags: 114688, childMatchedQueries: 0, matchedQueries: Object({  }), matchedQueryIds: 0, references: Object({  }), ngContentIndex: null, childCount: 1, bindings: [  ], bindingFlags: 0, outputs: [  ], element: Object({ ns: '', name: 'app-test-rest-api', attrs: [  ], template: null, componentProvider: Object({ nodeIndex: 1, parent: <circular reference: Object>, renderParent: <circular reference: Object>, bindingIndex: 0, outputIndex: 0, checkIndex: 1, flags: 114688, childFlags: 0, directChildFlags: 0, childMatchedQueries: 0, matchedQueries: Object, matchedQueryIds: 0, references: Object, ngContentIndex: -1, chi ...
        <= TestRestAPIComponent injects "BlogPostService", BlogPostService injects "HttpClient"...
          ... and HttpClient isn't getting picked up in the Jasmine environment...
       - FIX:
          import { HttpClient, HttpHandler } from '@angular/common/http';
          ...
          beforeEach(async(() => {
            TestBed.configureTestingModule({
              declarations: [ TestRestAPIComponent ],
              providers: [HttpClient, HttpHandler]
            })
            .compileComponents();
          }));

4. Current errors:
  - AppComponent > should create the app
Uncaught Error Code: undefined
Message: this.handler.handle is not a function thrown
    <= NEW ERROR...

  - BlogPostService > should retrieve blog posts
Error: Timeout - Async callback was not invoked within 5000ms (set by jasmine.DEFAULT_TIMEOUT_INTERVAL)
Error: Timeout - Async callback was not invoked within 5000ms (set by jasmine.DEFAULT_TIMEOUT_INTERVAL)
    <= SAME ERROR...
    
  - "this.handler.handle"
     <= A side-effect of including "HttpClient" (vs. "HttpClientTestingModule")
     https://stackoverflow.com/questions/51364455/typeerror-this-handler-handle-is-not-a-function-error
     <= OK: so apparently "HttpClient" is in no, way, shape or form compatible with Jasmine:
        *MUST* use  "HttpClientTestingModule" *EXCLUSIVELY* in *ALL* unit tests...

   - SOLUTION:
     - Needed to *IMPORT* HttpClientTestModule into TestRestAPI component test in order to make the "HttpClient"
       errors go away, all tests:

     - TestRestApi/test-rest-api.component.spec.ts:
       --------------------------------------------               
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TestRestAPIComponent } from './test-rest-api.component';

describe('TestRestAPIComponent', () => {
   let component: TestRestAPIComponent;
  let fixture: ComponentFixture<TestRestAPIComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ TestRestAPIComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestRestAPIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});       
  <= This (and app.component.spec.ts) now work...

5. No-go on making live REST call from Jasmine unit test:
6 specs, 1 failure, randomized with seed 35733
Spec List | Failures
BlogPostService > should retrieve blog posts
Error: Timeout - Async callback was not invoked within 5000ms (set by jasmine.DEFAULT_TIMEOUT_INTERVAL)
Error: Timeout - Async callback was not invoked within 5000ms (set by jasmine.DEFAULT_TIMEOUT_INTERVAL)
    <= Only viable solution appears to be using "HttpClientTestingModule"...
       ... and mocking with "HttpTestingController"










