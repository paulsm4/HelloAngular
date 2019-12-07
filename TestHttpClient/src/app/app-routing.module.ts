import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TestRestAPIComponent } from './TestRestAPI/test-rest-api.component';


const routes: Routes = [
  { path: '', component: TestRestAPIComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
