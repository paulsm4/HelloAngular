import { TestBed } from '@angular/core/testing';
//import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClientModule, HttpClient, HttpErrorResponse } from '@angular/common/http';

import { BlogPostService } from './blog-post.service';

describe('BlogPostService', () => {
  let httpClient: HttpClient;
  let service: BlogPostService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    httpClient = TestBed.get(HttpClient);
    service = TestBed.get(BlogPostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve blog posts', (done: DoneFn) => {
    service.getBlogPosts().subscribe(data => {
      done();
    });
  });
});
