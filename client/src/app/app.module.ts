import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { UserListComponent } from './users/user-list.component';
import { HomeComponent } from './home/home.component';
import { UserService } from './users/user.service';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from '@angular/cdk/layout';
import { UserCardComponent } from './users/user-card.component';
import { UserProfileComponent } from './users/user-profile.component';
import { AddUserComponent } from './users/add-user.component';
import { ProductListComponent } from './product/product-list/product-list.component';
import { ProductProfileComponent } from './product/product-profile/product-profile.component';
import { ProductCardComponent } from './product/product-card/product-card.component';
import { AddProductComponent } from './product/add-product/add-product.component';
import { ProductService } from './product/product.service';
import { PantryListComponent } from './pantry/pantry-list/pantry-list.component';
import { PantryService } from './pantry/pantry.service';
import { ShoppinglistProfileComponent } from './shoppinglist/shoppinglist-profile/shoppinglist-profile.component';
import { ShoppinglistCardComponent } from './shoppinglist/shoppinglist-card/shoppinglist-card.component';
import { ShoppinglistListComponent } from './shoppinglist/shoppinglist-list/shoppinglist-list.component';
import { ShoppinglistService } from './shoppinglist/shoppinglist.service';
import { AddPantryComponent } from './pantry/add-pantry/add-pantry.component';
import { PantryCardComponent } from './pantry/pantry-card/pantry-card.component';

const MATERIAL_MODULES: any[] = [
  MatListModule,
  MatButtonModule,
  MatIconModule,
  MatToolbarModule,
  MatCardModule,
  MatMenuModule,
  MatSidenavModule,
  MatInputModule,
  MatExpansionModule,
  MatTooltipModule,
  MatSelectModule,
  MatOptionModule,
  MatFormFieldModule,
  MatDividerModule,
  MatRadioModule,
  MatSnackBarModule,
  MatStepperModule,
  MatChipsModule,
  MatButtonToggleModule,
  MatDatepickerModule,
  MatNativeDateModule
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UserListComponent,
    UserCardComponent,
    UserProfileComponent,
    AddUserComponent,
    ProductListComponent,
    ProductProfileComponent,
    ProductCardComponent,
    AddProductComponent,
    PantryListComponent,
    ShoppinglistProfileComponent,
    ShoppinglistCardComponent,
    ShoppinglistListComponent,
    AddPantryComponent,
    PantryCardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    HttpClientModule,
    MATERIAL_MODULES,
    LayoutModule,
  ],
  providers: [
    UserService,
    ProductService,
    PantryService,
    ShoppinglistService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
