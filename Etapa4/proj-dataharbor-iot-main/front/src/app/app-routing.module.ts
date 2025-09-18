import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { InstitutionalComponent } from './institutional/institutional.component';

const routes: Routes = [
  {
    path: 'register',
    loadChildren: () =>
      import('./register.module').then((m) => m.RegisterModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'institutional',
    component: InstitutionalComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
