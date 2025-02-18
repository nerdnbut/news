import { Routes } from '@angular/router';
import { LoginComponent } from './modules/user/login/login.component';
import { RegisterComponent } from './modules/user/register/register.component';
import { NewsListComponent } from './modules/news/list/news-list.component';
import { NewsEditorComponent } from './modules/news/editor/news-editor.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { CategoryManagerComponent } from './modules/category/category-manager.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: '', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'news', 
    component: NewsListComponent,
    canActivate: [authGuard]
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
  }
];
