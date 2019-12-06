* ngSearchAhead: illustrate "search ahead" with Angular front-end to a REST API

1. App overview:
   * Bootstrap-based UI with a splash screen, a "search" text field, and two Angular components: 
     - book-list: lists all "found" items
     - book-item: shows book details

   * book.service: responsible for fetching book information from a REST API.

   * The BookServiceComponent "ngOnInit()" method uses Angular RxJS operators to 
     implement a use-friendly "lookhead" function in calling the REST API.

   * Project layout:
     - ngSearchAhead/
       +---src/
           +--- index.html, styles.css, ...
           +---app/
           |   +---app.module.ts, app.component.*
           |   +---book-item/
           |       +---book-item.component.*
           |   +---book-list/
           |       +---book-list.component.*
           |   +---model/
           |       +---book.ts
           |   \---services/
           |       +---book.service.ts, back-backend.ts
           +---assets/
           \---environments/

   * UI layout:
     - index.html
         <app-root>...
     
     - app.component.html
         <nav ...>{{title}}
         <div class="container">
           <app-book-list>...
         <nav ... fixed-bottom>
     
     - book-list.component.html
         <div id="angular-logo">  // float:left
         <div id="search"
           <div id="prompt">Enter title:
           <input name="searchBox"
         <div id="searchResults">
           <h2>We have found {{(books$|async)?.length}} books!
           <accordian>
             <app-book-item *ngFor="let book of books$ | async" [book]="book">...
             ...
     
     - book-item.html:
         <div class="book-container">
           <accordion-group heading="{{book.title}}">
             <div class="title">{{book.title}}</div>
             <div class="author">{{book.author}}</div>
             <div class="published">{{book.published | date:'yyyy'}}</div>  // Note "date" pipe
             <div class="genre">{{book.genre}}</div>
           </accordion-group>
         </div>
     
===================================================================================================

2. Create Angular project

   a) cd $PROJ/ngSearchAhead
      ng new ngSearchAhead
        Routing= N, CSS= CSS
      <= Creates skeleton Angular project

   b) cd $PROJ/ngSearchAhead/ngSearchAhead
      npm install ngx-bootstrap bootstrap --save
      <= Installs + ngx-bootstrap@3.1.4, + bootstrap@4.2.1; updates package.json

   c) ng g component book-list --module app.module
      ng g component book-item --module app.module
      <= Creates book-list, book-item components; registers both in app.module.ts

   d) ng g class model/book
      ng g service services/book
      <= Creates "Book" class and service

   e) ng g class services/fake-backend
      <= Creates our "mock" REST API

   f) ng --version
Angular CLI: 7.2.1
Node: 8.11.1
OS: win32 x64
Angular: 7.2.1
... animations, cli, common, compiler, compiler-cli, core, forms
... language-service, platform-browser, platform-browser-dynamic
... router

Package                           Version
-----------------------------------------------------------
@angular-devkit/architect         0.12.1
@angular-devkit/build-angular     0.12.1
@angular-devkit/build-optimizer   0.12.1
@angular-devkit/build-webpack     0.12.1
@angular-devkit/core              7.2.1
@angular-devkit/schematics        7.2.1
@ngtools/webpack                  7.2.1
@schematics/angular               7.2.1
@schematics/update                0.12.1
rxjs                              6.3.3
typescript                        3.2.2
webpack                           4.23.1

===================================================================================================

3. Implement code:

   a) Start VSCode editor:
      cd $PROJ/ngSearchAhead/ngSearchAhead
      code .

   b) src/styles.css:
@import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
      <= Add Bootstrap styling to global .css

   c) src/app/app.module.ts:
...
@NgModule({
  declarations: [
    AppComponent,
    BookListComponent,
    BookItemComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AccordionModule.forRoot()
  ],
  providers: [
    BookService,
    // Comment this out for "live" REST API
    fakeBackendProvider
  ],
...
      <= Register the Angular components that our app will be using

   d) src/app/app.component.html:
      <= Eliminate scaffolding code; substitute Bookstrap-based layout

   e) src/app/app.component.ts:
      <= Set title = 'ngSearchAhead Demo';

   f) src/app/model/book.ts:
      export interface Book {
        title: string;
        author: string;
        published: Date;
        genre: string;
      }
      <= Define our "Book" object

   g) src/app/services/fake-backend.ts
      <= "fakeBackendProvider" a mock REST API for demo purposes

   h) src/app/book-list/book-item.component.*
      <= Displays individual book(s)

   i) src/app/book-list/book-list.component.*
      <= Displays "found" book information; implements "search ahead"

===================================================================================================

4. Search Ahead details:

   a) The "magic" is implemented in book-list.component.ts:

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
        // this.searchTerms.next(this.searchString);
        this.books$ = this.bookService.getBooks(this.searchString)
          .pipe(share());
      }

   b) "books$" is declared as an RxJS "Observable". 
 
      - books$ has two subscribers:
        - book-list.component.html > *ngFor
          <= Angular will query the REST service for the set of matching book titles
          ... AND ...
        - book-list.component.html > {{(books$ | async)?.length}}
          <= This would *ALSO* make a call to the REST service, to query the #/matching books

      - To avoid making an unnecessary REST call, we add the "share()" operator to our pipe.  
        This ensures that despite having multiple subscriptions, there will only be one underlying trigger to the server.

   c) "searchTerms" is declared as an RxJS "Subject".

      - We use searchTerms to trigger an event anytime anybody types in the search box.

      - wrap searchTerms in an RxJS "pipe". The pipe contains:

        2) debounceTime() waits a brief time before triggering an event, so the user isn't making a REST call every keystoke. 
        3) distinctUntilChange() is another optimization to prevent unneeded REST calls to the server
        4) swtchMap() wires the "keystroke" event to the "bookService.getBooks()" REST call.
        5) share(): eliminate unneeded triggers on the shared observable
        ... AND ...
        1) We call invoke "startWith()" in ngOnInit() to make our first query when the component initializes.
           This ensures the user sees something right off the bat.

   d) search() is called by the searchBox <input> element.  It uses the same pipe we set up in ngOnInit() for the initial query.


===================================================================================================








