import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { ContactsService } from './contacts.service';

describe('ContactsService', () => {
  let httpClient: HttpClient;
  let service: ContactsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ContactsService, HttpClient]
    });
    // ERROR:
    //   "Timeout - Async callback was not invoked within 5000ms (set by jasmine.DEFAULT_TIMEOUT_INTERVAL)
    // Tried changing to 20000 - still getting Timeout...
    let originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // Getting timeout @default 5000
    httpClient = TestBed.get(HttpClient);
    //service = TestBed.get(ContactsService);
    service = new ContactsService(httpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all contacts', (done: DoneFn) => {
      service.getContacts().subscribe(data => {
        done();
    });
  });
});
