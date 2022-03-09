import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Pantry } from '../app/pantry/pantry';
import { PantryService } from '../app/pantry/pantry.service';

/**
 * A "mock" version of the `PantryService` that can be used to test components
 * without having to create an actual service.
 */
@Injectable()
export class MockPantryService extends PantryService {
  static testPantry: Pantry[] = [
    {
      _id: 'fried chicken_id',
      productId: 'fried chicken_id',
      purchaseDate: 'May 15, 2022',
      tags: 'fried',
      notes: 'This is fried chicken, by KFC'
    },
    {
      _id: 'roasted bread_id',
      productId: 'roasted bread_id',
      purchaseDate: 'Aug 23, 2021',
      tags: 'Roasted',
      notes: 'This is roasted steak, by SomeBread'
    },
    {
      _id: 'chocolate cookies_id',
      productId: 'chocolate cookies_id',
      purchaseDate: 'Mar 9, 2022',
      tags: 'Chocolate',
      notes: 'This is chocolate cookies, by CookieCompany'
    }
  ];

  constructor() {
    super(null);
  }

  getPantry(filters: {
    _id: string;
    productId: string;
    purchaseDate: string;
    tags: string;
    notes: string; }): Observable<Pantry[]> {
    // Just return the test pantrys regardless of what filters are passed in
    return of(MockPantryService.testPantry);
  }

  getPantryById(id: string): Observable<Pantry> {
    // If the specified ID is for the first test pantry,
    // return that pantry, otherwise return `null` so
    // we can test illegal pantry requests.
    if (id === MockPantryService.testPantry[0]._id) {
      return of(MockPantryService.testPantry[0]);
    } else {
      return of(null);
    }
  }

}
