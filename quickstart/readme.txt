* Angular Quickstart tutorial:
  https://angular.io/guide/quickstart

  - Uses Stackblitz (instead of CLI)
    "...to show you a ready-made, simple application"
    <= Can save to .zip file, or with GitHub account

  - Stackblitz editor: https://stackblitz.com/angular/gxydrlvnekq

* Templates (part 1):
1. Initial project:
   - Components: { app-root, app-top-bar (My Store, Checkout), app-product-list }
   - Data source: products.ts
     <= "export const products = [ ... ];
   - main.ts:
       import { AppModule } from './app/app.module';
       platformBrowserDynamic().bootstrapModule(AppModule);
   - app.module.ts:
       bootstrap: [ AppComponent ]
   - app.component.html:
       <app-top-bar></app-top-bar>
       <div class="container">
         <router-outlet></router-outlet>
       </div>
   - app.component.ts:
       @Component({
         selector: 'app-root',
         templateUrl: './app.component.html',
         styleUrls: [ './app.component.css' ]
       })
      export class AppComponent  {}

2. Show products:
   - product-list/product-list.component.html: Added:
       <div *ngFor="let product of products">
         <h3>{{ product.name }}</h3>

     product-list/product-list.component.ts (unchanged):
       import { Component } from '@angular/core';
       import { products } from '../products';

       @Component({
         selector: 'app-product-list',
         templateUrl: './product-list.component.html',
         styleUrls: ['./product-list.component.css']
       })
       export class ProductListComponent {
         products = products;
         ...

3. Link product details:
   - product-list/product-list.component.html: Added:
       <h2>Products</h2>
         <div *ngFor="let product of products">
           <h3>
             <a [title]="product.name + ' details'">{{ product.name }}</a>
           </h3>
         </div>

   - WORTSCHATZ:
     - Interpolation: {{ }}: Lets you render a property value as text
     - Binding: []: Lets you use a property value in a template expression

4. Add property descriptions:
   - product-list/product-list.component.html: Added:
       ...
       <p *ngIf="product.description">Description: {{ product.description }}</p>
       <= Conditional add: "<p>" tag not added if "product.description" null/empty

5. Add "share product with friends" button:
   - product-list/product-list.component.html: Added:
       ...
       <button (click)="share()">Share</button>
       <= (click) event bound to share() event handler

   - WORTSCHATZ:
     - Evebt binding: ()

* Components (part 2):

1. Generate "product-alerts"
   - Stackblitz: app > Angular Generator > Component > product-alerts
   - CLI: ng g component product-alerts/product-alerts
     <= auto-generates:
        src/app/product-alerts/
          product-alerts.component.ts, product-alerts.component.html, product-alerts.component.css, product-alerts.spec.ts

2. product-alerts.component.ts (auto-generated):
     import { Component, OnInit } from '@angular/core';
     @Component({
       selector: 'app-product-alerts',
       templateUrl: './product-alerts.component.html',
       styleUrls: ['./product-alerts.component.css']
     })
     export class ProductAlertsComponent implements OnInit {
       constructor() { }
       ngOnInit() {
       }
     }

3. Add "Input":
   - product-alerts/product-alerts.component.ts:
       ...
       import { Input } from '@angular/core';
       ...
       export class ProductAlertsComponent implements OnInit {
         @Input() product;
         constructor() { }
         ...
         <= "product-alerts" component will receive a "product" as input...

4. Define the product-alert view:
   - product-alerts/product-alerts.component.html:
       <p *ngIf="product.price > 700">
         <button>Notify Me</button>
       </p>  
       <= Button will display if product.price > 700...

5. Modify product-list to use product-alerts:
   - product-list/product-list.component.html:
       ...
       <app-product-alerts [product]="product"></app-product-alerts>
       <= The new product alert component takes a product as input from the product list.
          With that input, it shows or hides the "Notify Me" button, based on the price of the product. 
          The Phone XL price is over $700, so the "Notify Me" button appears on that product.

6. To make the "Notify Me" button work, you need to configure two things:

   6.1) the product alert component to emit an event when the user clicks "Notify Me"
   - product-alerts/product-alerts.component.ts:
       import { Component } from '@angular/core';
       import { Input } from '@angular/core';
       import { Output, EventEmitter } from '@angular/core';

       export class ProductAlertsComponent {
         @Input() product;
         @Output() notify = new EventEmitter();
       }
       <= @Output()/new EventEmitter() allows the product alert component 
          to emit an event  when the value of the notify property changes.

   - product-alerts/product-alerts.component.html:
       <p *ngIf="product.price > 700">
         <button (click)="notify.emit()">Notify Me</button>
       </p>

   6.2) the product list component to act on that event
   - product-list/product-list.component.ts:
       ...
       export class ProductListComponent {
         products = products;
         ...
         onNotify() {
           window.alert('You will be notified when the product goes on sale');
         }

   - product-list/product-list.component.html:
       ...
       <app-product-alerts
         [product]="product" (notify)="onNotify()">
       </app-product-alerts>
       <= Clicking the "Notify Me" button will display "You will be notified when the product goes on sale"

* Handy commands:
  - npm --version: 6.8.0; npm -g update; npm --version: 6.13.1
  - node --version: 10.15.1
  - ng --version: 7.3.19; npm install -g @angular/cli@latest: 8.3.19
  - ng g component product-alerts/product-alerts
    <= Auto generate, type= {class, component, module, service, ...} path/root-name
  - ng serve
  - ng build
  - npm update
    <= (Re)build local node_modules subfolder

