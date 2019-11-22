* Angular/Tutorials (PM):
  - https://dev.to/dileno/build-a-simple-crud-app-with-angular-8-and-asp-net-core-2-2-part-1-back-end-39e1
    https://dev.to/dileno/build-an-angular-8-app-with-rest-api-and-asp-net-core-2-2-part-2-46ap

  - D/L example code from Git:
    https://github.com/dileno/Blog-tutorial-Angular-8-.NET-Core-2.2-CRUD
    NOTES:
    - Unable to preview Git READE.md from Chrome or FF ... but VSCode worked great!
    - Extracted Git .zip (Blog-tutorial-Angular-8-.NET-Core-2.2-CRUD-master.zip), but used as reference only.

===================================================================================================

* Create ASP.NET Core 2.2 REST API (Part 1):
  - MSVS > Create project > 
      Language= C#, Template= ASP.Net Core Web Application >
      Project name= Blog, [Create]
      .Net Core= Y, ASP.Net Core= 3.0, Angular= Y, [Create]
     <= Created C:\paul\proj\HelloAngular\dotnetcore-angular8\Blog; 
        "ClientApp\" one of the subfolders
        
  - Add models, DBContext:
    - New folder > Models >
        New class > BlogPost.cs
        New Controller > APIController with actions, using EF > 
          Model class > BlogPost, 
          Data context class > (+) > Blog.Models.BlogPostsContext,
          Controller name= BlogPostsController

      - Auto-generates:
        - Controllers\BlogPostsController.cs
          <= async Task<ActionResult> methods for all CRUD operations: GET, PUT (update), POST (add), DELETE
             "BlogOstsContext context" DI via BlogPostsController() constructor
        - Models\BlogPostsContext.cs
           
  - Create a data repository:
    - IDataRepository.cs:
      public interface IDataRepository<T> where T : class {
        void Add(T entity);
        void Update(T entity);
        void Delete(T entity);
        Task<T> SaveAsync(T entity);
      }

    - DataRepository.cs

  - Update BlogPostsController to use the data repository *AND* the DBContext:
      public class BlogPostsController : ControllerBase {
        private readonly BlogPostsContext _context;
        private readonly IDataRepository<BlogPost> _repo;

        public BlogPostsController(BlogPostsContext context, IDataRepository<BlogPost> repo)
        {
            _context = context;
            _repo = repo;
        <= Controller uses *BOTH*...

     - CONTEXT EXAMPLE:
         public IEnumerable<BlogPost> GetBlogPosts() {
            return _context.BlogPosts.OrderByDescending(p => p.PostId);
     - REPO EXAMPLE:
         public async Task<IActionResult> DeleteBlogPost([FromRoute] int id)
           ...
           _repo.Add(blogPost);
           var save = await _repo.SaveAsync(blogPost);

  - Add CORS in app configuration (for JS) and register our DataRepository:
    - Startup.cs:
        public void ConfigureServices(IServiceCollection services)
          ...
          services.AddDbContext<BlogPostsContext>(options =>
                    options.UseSqlServer(Configuration.GetConnectionString("BlogPostsContext")));

          services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials());
            });

          services.AddScoped(typeof(IDataRepository<>), typeof(DataRepository<>));

       public void Configure(IApplicationBuilder app, IHostingEnvironment env)
         ...
         app.UseCors("CorsPolicy");
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            //app.UseSpaStaticFiles();

         app.UseMvc(routes =>
           {
             routes.MapRoute(
             name: "default",
             template: "{controller}/{action=Index}/{id?}");
         });
    
    - PROBLEM: Got nasty warning:
Warning	MVC1005	Using 'UseMvc' to configure MVC is not supported while using Endpoint Routing. 
To continue using 'UseMvc', please set 'MvcOptions.EnableEndpointRouting = false' inside 'ConfigureServices'.
      - Per MSDN, endpointrouting default= "false" in .Net Core 2.1 and earlier; "true" in .Net Core 2.2 and higher
https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.mvcoptions.enableendpointrouting?view=aspnetcore-3.0
      - SOLUTION:
          Add to ConfigureServices(...):
            services.AddMvc(option => option.EnableEndpointRouting = false);

   - NOTES:
     - Comment out app.UseSpa() etc. stuff from "Statup.Configure(...)"; substitute app.UseMvc(...) 
     - UseCors ust come before UseMvc
       <= Per above example...

  - MSVS > Properties > launchSettings.json:
    <= Set "launchUrl": ""
       Didn't exist in my version, ADDED

  - MSVS > Controllers > DELETE ValuesController.cs
    <= Didn't exist in my project, deleted WeatherForecastController.cs instead

  - Setup migrations and create the database
      appSettings.json:
 "ConnectionStrings": {
    "BlogPostsContext": "Server=(localdb)\\mssqllocaldb;Database=BlogPostsContext-036b56b6-53c5-4ead-bfcd-652e972350c8;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
      <= No more Web.Config, Boys and Girls!

    - MSVS > Tools > Nuget > Add-Migration Initial
      <= Creates MSVS > Migrations > 
         { 20191119233443_Initial.cs, BlogPostsContextModelSnapshot.cs }

    - Update-Database -Verbose
      <= Appears successful ... but no clue where the DB was written...

    - MSVS > View > SQL Server Object Explorer >
        ConnString= Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=BlogPostsContext-036b56b6-53c5-4ead-bfcd-652e972350c8;Integrated Security=True;Connect Timeout=30;Encrypt=False;TrustServerCertificate=False;ApplicationIntent=ReadWrite;MultiSubnetFailover=False
        Data file= C:\Users\paulsm\BlogPostsContext-036b56b6-53c5-4ead-bfcd-652e972350c8.mdf

  - Test API:
    - MSVS  > F5 > Run IIS Express
      <= ERROR: Startup > ConfigureServices() > services.AddCors():
System.InvalidOperationException
  HResult=0x80131509
  Message=The CORS protocol does not allow specifying a wildcard (any) origin and credentials at the same time. Configure the CORS policy by listing individual origins if credentials needs to be supported.
  Source=Microsoft.AspNetCore.Cors
  StackTrace:
   at Microsoft.AspNetCore.Cors.Infrastructure.CorsPolicyBuilder.Build()
   at Microsoft.AspNetCore.Cors.Infrastructure.CorsOptions.AddPolicy(String name, Action`1 configurePolicy)
   at Blog.Startup.<>c.<ConfigureServices>b__4_1(CorsOptions options) in C:\paul\proj\HelloAngular\dotnetcore-angular8\Blog\Startup.cs:line 40
   at Microsoft.Extensions.Options.ConfigureNamedOptions`1.Configure(String name, TOptions options)
   at Microsoft.Extensions.Options.OptionsFactory`1.Create(String name)
   at Microsoft.Extensions.Options.OptionsManager`1.<>c__DisplayClass5_0.<Get>b__0()
   at System.Lazy`1.ViaFactory(LazyThreadSafetyMode mode)

    - Link:
https://stackoverflow.com/questions/53675850/how-to-fix-the-cors-protocol-does-not-allow-specifying-a-wildcard-any-origin
      <= WORKAROUND: Commented out ".AllowCredentials()" from options.AddPolicy("CorsPolicy"...

    - Postman > POST https://localhost:44330/api/blogposts
{
  "dt": "2019-09-12T18:18:02.190Z",
  "creator": "Martin",
  "title": "Test",
  "body": "Testing"
}
     - NEXT PROBLEM:
Could not get any response
There was an error connecting to https://localhost:44330/api/blogposts.
     - SOLUTION:
       Postman > Settings ("wrench" icon, not "gear"!!!), SSL certificate verification => OFF

    - Tried again: OK.  Response:
{
    "postId": 1,
    "creator": "Martin",
    "title": "Test",
    "body": "Testing",
    "dt": "2019-09-12T18:18:02.19Z"
}
    - GET https://localhost:44330/api/blogposts: OK.  Resonse:
[
    {
        "postId": 1,
        "creator": "Martin",
        "title": "Test",
        "body": "Testing",
        "dt": "2019-09-12T18:18:02.19"
    }
]

  << Saved backup: C:\paul\proj\HelloAngular\dotnetcore-angular8.bu2 >>

===================================================================================================

* Create the Angular 8 app (Part 2)
  - Install/Update client S/W:
    - npm --version: 6.8.0; npm -g update; npm --version: 6.13.1
    - node --version: v10.13.0
    - ng --version: 7.3.19; npm install -g @angular/cli@latest: 8.3.19

    - cd C:\paul\proj\HelloAngular\dotnetcore-angular8\Blog\ClientApp
      <= This was auto-generated by MSVS, "API" project type, " ASP.Net Core Web Application" template, selected "Angular"

    - npm update; ng version =>
Your global Angular CLI version (8.3.19) is greater than your local
version (8.0.6). The local Angular CLI version is used.
      <= So MSVS template gave us a (slightly!) older version

    - ng config -g cli.warnings.versionMismatch false
      ng serve
      browse > http://localhost:4200
      <= Displays MS scaffolding app (*NOT* Angular's scaffolding version)

  - Angular Architecture 101:
    - Modules: mechanism for grouping components, directives, pipes and services, etc. that are functionally related,
      <= Every Angular app has at least one "root" module
    - Components: Each provides a "class" (.ts code) + a "view" (.html template)
      <= Components may call other components in a parent/child (tree) relationship; components may be re-used
    - Templates, Directives, Data-Binding
      <= .html templates may use directives (*ngIf, *ngFor, etc), interpolation ({}), data binding ([]), pipes, etc
    - Services and dependency injection
      <= Service classes: implement functionality that isn’t tied to any specific view; services are injectible.
    - Routing:
      <= The Router NgModule provides a service that defines navigation in the app

  - MSVS vs. VSCode:
    <= You can actually use *ANY* text editor.  VSCode is usually "better" for front-end apps
    - cd C:\paul\proj\HelloAngular\dotnetcore-angular8\Blog\ClientApp
      code .
      <= Starts VSCode
    - Extensions:
      <= { John Papa Angular Snippets, Debugger for Chrome, TSLint } already installed/enabled

  - Add Bootstrap to project
    <= Bootstrap 4.3.1 already added in default "package.json" auto-generated by MSVS Angular template
       Else:
       - "npm install bootstrap --save"  // Updates package.json
       - angular.json // Add "styles": [  "src/styles.scss",  "node_modules/bootstrap/dist/css/bootstrap.min.css", ... ]

  - Create components:
      ng generate component BlogPosts
      ng generate component BlogPost
      ng generate component BlogPost-AddEdit
      <= ERROR:
More than one module matches. Use skip-import option to skip importing the component into the closest module.
    - PROBLEM: MSVS generated *TWO* modules: app.module.ts, and app.server.module.ts
https://stackoverflow.com/questions/44551277/asp-net-core-angular-template-app-module-client-vs-app-module-server/44804220
    - app.server.module.ts > export AppServerModule > referenced *ONLY* by tsconfig.server.json
      DELETED app.server.module.ts, restarted "ng serve"
      <= OK

    - C:\paul\proj\HelloAngular\dotnetcore-angular8\Blog\ClientApp>ng generate component BlogPosts
CREATE src/app/blog-posts/blog-posts.component.html (25 bytes)
CREATE src/app/blog-posts/blog-posts.component.spec.ts (650 bytes)
CREATE src/app/blog-posts/blog-posts.component.ts (284 bytes)
CREATE src/app/blog-posts/blog-posts.component.css (0 bytes)
UPDATE src/app/app.module.ts (1267 bytes)
      <= OK

    - ng generate component BlogPost
      ng generate component BlogPost-AddEdit
      <= ALSO OK
      - NOTES: 
        - we did *not* need to explicitly specify subdirectory (e.g. "blog-posts/blog-posts.component.ts"): ng g did it for us
        - Convention seems to be "one ASP.Net MVC view :: one Angular component"

    - C:\paul\proj\HelloAngular\dotnetcore-angular8\Blog\ClientApp>ng generate service BlogPost
CREATE src/app/blog-post.service.spec.ts (344 bytes)
CREATE src/app/blog-post.service.ts (137 bytes)
      <= Whoops.  We *SHOULD* have used "ng g service services/BlogPost"!
         Manually moved "blog-post.service.*" to "services/"

  - Update app.module.ts:
    <= Cleaned up a lot of MS-generated cruft.
    - DELETED: { counter/, fetch-data/, home/, nav-menu/ }
    - PROBLEM: 
        app.module.ts > "import { AppRoutingModule } from './app-routing.module'; > NOT FOUND
        <= Copied from .zip...
    - app.module.ts now compiles cleanly

  - app-routing.module.ts:
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BlogPostsComponent } from './blog-posts/blog-posts.component';
import { BlogPostComponent } from './blog-post/blog-post.component';
import { BlogPostAddEditComponent } from './blog-post-add-edit/blog-post-add-edit.component';

const routes: Routes = [
  { path: '', component: BlogPostsComponent, pathMatch: 'full' },
  { path: 'blogpost/:id', component: BlogPostComponent },
  { path: 'add', component: BlogPostAddEditComponent },
  { path: 'blogpost/edit/:id', component: BlogPostAddEditComponent },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

  - app.component.ts:
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ClientApp';
}
  <= Only change from MSVS: "app" => "ClientApp"

  - app.component.html:
<div class="container">
  <a [routerLink]="['/']" class="btn btn-info">Start</a>
  <router-outlet></router-outlet>
</div>
  <= ERROR: Can't bind to 'routerLink' since it isn't a known property of 'a'.
    - SOLUTION:
      - Ensure app-routing.module.ts exists
        <= Needed to copy from .zip
      - Ensure app-routing.module.ts:
        - imports { Routes, RouterModule } from '@angular/router
        - @NgModule imports: [RouterModule.forRoot(routes)],
        - @NgModule exports: [RouterModule]
      - app.module.ts: Move "import { AppRoutingModule } from './app-routing.module';" to top
      <= RouterLink, <router-outlet>, etc. all come from @angular/core/* 

  - cd C:\paul\proj\HelloAngular\dotnetcore-angular8\Blog\ClientApp
    ng serve
    Browser > http://localhost:4200
    <= See [Start] button
       This is the view for our BlogPostAddEditComponent...

  - To run app from MSVS (instead of "ng serve"):
    - MSVS > Startup.cs > 
      - ConfigureServices(....)
            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });

      - Configure (...)
            app.UseCors("CorsPolicy");
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
            ...
            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";
                if (env.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });

      - F5 > Run 
          https://localhost:44330/
          <= "http" just hangs ... need "https"...

  - Update "appUrl" in environment.ts (VSCode):
export const environment = {
  production: false,
  appUrl: 'https://localhost:44330/'
};
    <= Whether you want to use the Node.js command prompt to build and run the Angular application is up to you. 
       Just remember the back-end needs to be up and running too.
       Visual Studio building and running both the front-end and back-end means one less thing to think about.

===================================================================================================

* Create blog post model and service methods (Part 2, continued):
  - cd C:\paul\proj\HelloAngular\dotnetcore-angular8\Blog\ClientApp
    ng g class models/BlogPost =>
CREATE src/app/models/blog-post.spec.ts (167 bytes)
CREATE src/app/models/blog-post.ts (27 bytes)
    
    - models/blog-post.ts:
export class BlogPost {
  postId?: number;
  creator: string;
  title: string;
  body: string;
  dt: Date;
}
    - NOTES: 
      - Can either use "ng g class models/BlogPost", or use "Angular > Generate > Class" directly from VSCode
      - Original .zip writes file directly to src/app; this example writes to subdirectory "models"
      - Original names file ""BlogPost.ts"; this example uses ng "kebab" convention for Pascal-case name

  - Implement CRUD services (services/blog-post.service.ts):
...
@Injectable({
  providedIn: 'root'
})
export class BlogPostService {
  myAppUrl: string;
  myApiUrl: string;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8'
...
  constructor(private http: HttpClient) {
      this.myAppUrl = environment.appUrl;
      this.myApiUrl = 'api/BlogPosts/';

  getBlogPosts(): Observable<BlogPost[]> 
    return this.http.get<BlogPost[]>(this.myAppUrl + this.myApiUrl)

  getBlogPost(postId: number): Observable<BlogPost> {
      return this.http.get<BlogPost>(this.myAppUrl + this.myApiUrl + postId)

  saveBlogPost(blogPost): Observable<BlogPost> {
      return this.http.post<BlogPost>(this.myAppUrl + this.myApiUrl, JSON.stringify(blogPost), this.httpOptions)

  updateBlogPost(postId: number, blogPost): Observable<BlogPost> {
      return this.http.put<BlogPost>(this.myAppUrl + this.myApiUrl + postId, JSON.stringify(blogPost), this.httpOptions)

  deleteBlogPost(postId: number): Observable<BlogPost> {
      return this.http.delete<BlogPost>(this.myAppUrl + this.myApiUrl + postId)

  errorHandler(error) {
      ...		
      console.log(errorMessage);
      return throwError(errorMessage);
  <= NOTE: We already injected the service into the providers array in app.module.ts, so we're set to use these in our app:
@NgModule({
...
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule
  ...
  providers: [
    BlogPostService

  - RxJS observables: https://angular.io/guide/observables
    - WORTSCHATZ:
      - Observables: provide support for passing messages between publishers and subscribers in your application
      - Observables are declarative.  That is, you define a function for publishing values, but it is not executed until a consumer subscribes to it. 
      - The subscribed consumer then receives notifications until the function completes, or until they unsubscribe.
      - As a publisher, you create an Observable instance that defines a subscriber function.
      - To execute the observable you have created and begin receiving notifications, you call its subscribe() method, passing an observer

    - EXAMPLE (services/blog-post.service.ts):
  getBlogPosts(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(this.myAppUrl + this.myApiUrl)
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    );
  }
    - NOTES:
      - We make our BlogPostService injectable via the @Injectable() decorator.
      - Then we use the pipe() method for each service call. 
        Here we can pass in operator functions for data transformation in our observable collection. 
        We add retry and catchError to our pipe method.
      - It’s very common to subscribe to observables in Angular.
        This is fine, but you have to remember to unsubscribe too. 
        "pipe" does that automatically for you, freeing up memory resources and preventing leaks.


  - Update blog-posts.component.ts:
@Component({
  selector: 'app-blog-posts',
  templateUrl: './blog-posts.component.html',
  ...
export class BlogPostsComponent implements OnInit {
  blogPosts$: Observable<BlogPost[]>;

  constructor(private blogPostService: BlogPostService) { }

  ngOnInit() {
    this.loadBlogPosts();
 
 loadBlogPosts() {
    this.blogPosts$ = this.blogPostService.getBlogPosts();

  delete(postId) {

  - Update blog-posts.component.html:
    NOTES:
    - async pipe syntax: "<p *ngIf="!(blogPosts$ | async)"><em>Loading...</em></p>" ...
    - It takes a long, long, LONG time for everything to come up in MSVS
    - Can run concurrently with MSVS (client= https://localhost:44330/) and ng serve (client= http://localhost:4200)
    - EITHER URL accessible from Chrome, *BOTH* display the record we entered via Postman above (Title= Test, Creator= Martin, Date= 12.09.2019)

  - Update  blog-post.component.ts,l blog-post.component.html (view blog post):
    <= View post: https://localhost:44330/blogpost/1

  - Update blog-post-add-edit.component.ts, blog-post-add-edit.component.html (add/edit blog post):
    <= Add/Edit post: https://localhost:44330/blogpost/edit/1

    - blog-post-add-edit.component.gs:
  constructor(private blogPostService: BlogPostService, private formBuilder: FormBuilder, private avRoute: ActivatedRoute, private router: Router) {
    const idParam = 'id';
    this.actionType = 'Add';
    this.formTitle = 'title';
    this.formBody = 'body';
    if (this.avRoute.snapshot.params[idParam]) {
      this.postId = this.avRoute.snapshot.params[idParam];
    }

    this.form = this.formBuilder.group({
      postId: 0,
      title: ['', [Validators.required]],
      body: ['', [Validators.required]],
      ...
  ngOnInit() {
    if (this.postId > 0) {
      this.actionType = 'Edit';
      this.blogPostService.getBlogPost(this.postId)
        .subscribe(data => (
          this.existingBlogPost = data,
          this.form.controls[this.formTitle].setValue(data.title),
          this.form.controls[this.formBody].setValue(data.body)
        ));
      ...
    save() {
    if (!this.form.valid) {
      return;
      ...
    if (this.actionType === 'Add') {
      let blogPost: BlogPost = {
        dt: new Date(),
        creator: 'Martin',
        title: this.form.get(this.formTitle).value,
        body: this.form.get(this.formBody).value
      ...
      this.blogPostService.saveBlogPost(blogPost)
        .subscribe((data) => {
          this.router.navigate(['/blogpost', data.postId]);
      ...
    if (this.actionType === 'Edit') {
      let blogPost: BlogPost = {
        postId: this.existingBlogPost.postId,
        dt: this.existingBlogPost.dt,
        creator: this.existingBlogPost.creator,
        title: this.form.get(this.formTitle).value,
        body: this.form.get(this.formBody).value
      };
      this.blogPostService.updateBlogPost(blogPost.postId, blogPost)
        .subscribe((data) => {
          this.router.navigate([this.router.url]);
      ...
    NOTES:
    - Introduces Angular forms: FormBuilder, FormGroup and also Validators.
    - Depending on if we’re creating a new blog post or editing an existing one, we use "actionType".
  << At this point, we're "done": the entire back- and front-ends are completely functional >> 

  - Delete blog:
    - blog-posts.component.html:
    ...
    <tr *ngFor="let blogPost of (blogPosts$ | async)">
      <td><a [routerLink]="['/blogpost/edit/', blogPost.postId]" class="btn btn-primary btn-sm float-right">Edit</a></td>
      <td><a [routerLink]="" (click)="delete(blogPost.postId)" class="btn btn-danger btn-sm float-right">Delete</a></td>
      <= "delete" button  routes to "blog-posts" component

    - blog-posts.component.html:
    ...
    delete(postId) {
      const ans = confirm('Do you want to delete blog post with id: ' + postId);
      if (ans) {
        this.blogPostService.deleteBlogPost(postId).subscribe((data) => {
          this.loadBlogPosts();
          ...

    - VSCode: 
      - set bkpts in blog-posts.component@delete(), 
      - Debugger > Add Configuration > Chrome
      - launch.json >'
        ...
        "configurations": [{
            "type": "chrome",
            "request": "launch",
            "name": "Launch Chrome against localhost",
            "url": "https://localhost:44330",
            "webRoot": "${workspaceFolder}"
            ...


         



