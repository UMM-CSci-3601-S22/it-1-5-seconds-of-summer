import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { MockShoppingListService } from '../../../testing/shoppingList.service.mock';
import { Shoppinglist } from '../shoppinglist';
import { ShoppinglistCardComponent } from '../shoppinglist-card/shoppinglist-card.component';
import { ShoppinglistListComponent } from '../shoppinglist-list/shoppinglist-list.component';
import { ShoppinglistService } from '../shoppinglist.service';
import { MatIconModule } from '@angular/material/icon';

const COMMON_IMPORTS: any[] = [
  FormsModule,
  MatCardModule,
  MatFormFieldModule,
  MatSelectModule,
  MatOptionModule,
  MatButtonModule,
  MatInputModule,
  MatExpansionModule,
  MatTooltipModule,
  MatListModule,
  MatDividerModule,
  MatRadioModule,
  MatIconModule,
  BrowserAnimationsModule,
  RouterTestingModule,
];

describe('ShoppingList list', () => {

  let shoppingListList: ShoppinglistListComponent;
  let fixture: ComponentFixture<ShoppinglistListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [ShoppinglistListComponent, ShoppinglistCardComponent],
      // providers:    [ ShoppingListService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{ provide: ShoppinglistService, useValue: new MockShoppingListService() }]
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ShoppinglistListComponent);
      shoppingListList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('contains all the shoppingLists', () => {
    expect(shoppingListList.serverFilteredShoppinglists.length).toBe(3);
  });

  it('contains a shoppingList named \'Chris\'', () => {
    // eslint-disable-next-line max-len
    expect(shoppingListList.serverFilteredShoppinglists.some((shoppingList: Shoppinglist) => shoppingList.productName === 'jack')).toBe(true);
  });

  it('contain a shoppingList named \'Jamie\'', () => {
    // eslint-disable-next-line max-len
    expect(shoppingListList.serverFilteredShoppinglists.some((shoppingList: Shoppinglist) => shoppingList.productName === 'Collin')).toBe(true);
  });

  it('doesn\'t contain a shoppingList named \'Santa\'', () => {
    // eslint-disable-next-line max-len
    expect(shoppingListList.serverFilteredShoppinglists.some((shoppingList: Shoppinglist) => shoppingList.productName === 'Santa')).toBe(false);
  });

  it('has two shoppingLists that are 37 years old', () => {
    expect(shoppingListList.serverFilteredShoppinglists.filter((shoppingList: Shoppinglist) => shoppingList.quantity === 1).length).toBe(1);
  });
});
