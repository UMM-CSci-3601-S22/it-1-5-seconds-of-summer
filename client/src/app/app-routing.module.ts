import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserListComponent } from './users/user-list.component';
import { UserProfileComponent } from './users/user-profile.component';
import { AddUserComponent } from './users/add-user.component';
import { ProductListComponent } from './product/product-list/product-list.component';
import { AddProductComponent } from './product/add-product/add-product.component';
import { ProductProfileComponent } from './product/product-profile/product-profile.component';

// Note that the 'users/new' route needs to come before 'users/:id'.
// If 'users/:id' came first, it would accidentally catch requests to
// 'users/new'; the router would just think that the string 'new' is a user ID.
const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'users', component: UserListComponent},
  {path: 'users/new', component: AddUserComponent},
  {path: 'users/:id', component: UserProfileComponent},
  // {path: 'shoppingLists', component: ShoppingListListComponent},
  // {path: 'pantrys', component: PantryListComponent},
  // {path: 'pantrys/new', component: AddPantryComponent},
  // {path: 'pantrys/:id', component: PantryProfileComponent},
  {path: 'products', component: ProductListComponent},
  {path: 'products/new', component: AddProductComponent},
  {path: 'products/:id', component: ProductProfileComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
