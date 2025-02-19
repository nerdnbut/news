import { Routes } from '@angular/router';
import { LoginComponent } from './modules/user/login/login.component';
import { RegisterComponent } from './modules/user/register/register.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { NewsDetailComponent } from './modules/news/detail/news-detail.component';
import { NewsEditorComponent } from './modules/news/editor/news-editor.component';
import { CategoryManagerComponent } from './modules/category/category-manager.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: '', 
    component: DashboardComponent
  },
  { 
    path: 'news/detail/:id', 
    component: NewsDetailComponent
  },
  { 
    path: 'news/create', 
    component: NewsEditorComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'news/edit/:id', 
    component: NewsEditorComponent,
    canActivate: [authGuard]
  },
  {
    path: 'categories',
    component: CategoryManagerComponent,
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./modules/user/profile/profile.component')
      .then(m => m.ProfileComponent),
    canActivate: [authGuard]
  }
];
