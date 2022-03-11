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
      prodID: 'bruh',
      date: 'May 15, 2022',
      name: 'Chris'
    },
    {
      _id: '1',
      prodID: 'cap',
      date: 'May 15, 2022',
      name: 'Peanut'
    },
    {
      _id: '2',
      prodID: 'brim',
      date: 'May 15, 2022',
      name: 'pog'
    }
  ];

  constructor() {
    super(null);
  }

  getPantrys(filters: {
    prodID?: string;
    date?: string;
    name?: string;
  }): Observable<Pantry[]> {
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
