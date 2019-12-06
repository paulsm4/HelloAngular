import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AccordionModule } from 'ngx-bootstrap';

import { AppComponent } from './app.component';
import { BookListComponent } from './book-list/book-list.component';
import { BookItemComponent } from './book-item/book-item.component';
import { BookService } from './services/book.service';
import { fakeBackendProvider } from './services/fake-backend';

@NgModule({
  declarations: [
    AppComponent,
    BookListComponent,
    BookItemComponent
  ],
  imports: [
    BrowserModule,
    // ReactiveFormsModule
    FormsModule,
    HttpClientModule,
    AccordionModule.forRoot()
  ],
  providers: [
    BookService,
    // Comment this out for "live" REST API
    fakeBackendProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
