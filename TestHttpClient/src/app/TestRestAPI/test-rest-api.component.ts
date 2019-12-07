import { Component, OnInit } from '@angular/core';
import { BlogPost } from 'src/app/models/blog-post';
import { BlogPostService } from 'src/app/services/blog-post.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-test-rest-api',
  templateUrl: './test-rest-api.component.html',
  styleUrls: ['./test-rest-api.component.css']
})
export class TestRestAPIComponent implements OnInit {

  blogPosts$: Observable<BlogPost[]>;

  constructor(private blogPostService: BlogPostService) { }

  ngOnInit() {
    this.loadBlogPosts();
  }

  loadBlogPosts() {
    this.blogPosts$ = this.blogPostService.getBlogPosts();
  }

}
