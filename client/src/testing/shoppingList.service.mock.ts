import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Shoppinglist, ShoppingStore} from '../app/shoppinglist/shoppinglist';
import { ShoppinglistService } from '../app/shoppinglist/shoppinglist.service';

/**
 * A "mock" version of the `ShoppingListService` that can be used to test components
 * without having to create an actual service.
 */
@Injectable()
export class MockShoppingListService extends ShoppinglistService {
  static testShoppingLists: Shoppinglist[] = [
    {
      _id: '7',
      productName: 'nate',
      store: 'coop',
      quantity: 1
    },
    {
      _id: '69',
      productName: 'jack',
      store: 'willies',
      quantity: 15
    },
    {
      _id: '62267f81fc13ae223000127b',
      productName: 'Collin',
      store: 'willies',
      quantity: 12
    }
  ];

  constructor() {
    super(null);
  }

  getShoppinglists(filters: { store?: ShoppingStore; quantity?: number; productName?: string }): Observable<Shoppinglist[]> {
    // Just return the test shoppingLists regardless of what filters are passed in
    return of(MockShoppingListService.testShoppingLists);
  }

  getShoppinglistById(id: string): Observable<Shoppinglist> {
    // If the specified ID is for the first test shoppingList,
    // return that shoppingList, otherwise return `null` so
    // we can test illegal shoppingList requests.
    if (id === MockShoppingListService.testShoppingLists[0]._id) {
      return of(MockShoppingListService.testShoppingLists[0]);
    } else {
      return of(null);
    }
  }

}
