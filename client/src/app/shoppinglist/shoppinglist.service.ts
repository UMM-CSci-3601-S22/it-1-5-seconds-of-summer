import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Shoppinglist, ShoppingStore } from './shoppinglist';
import { map } from 'rxjs/operators';

@Injectable()
export class ShoppinglistService {
  readonly shoppinglistUrl: string = environment.apiUrl + 'shoppingList';

  constructor(private httpClient: HttpClient) {
  }

  getShoppinglists(filters?: {
    productName?: string;
    store?: ShoppingStore;
    quantity?: number; }): Observable<Shoppinglist[]> {

    let httpParams: HttpParams = new HttpParams();

    if (filters) {
      if (filters.productName) {
        httpParams = httpParams.set('name', filters.productName);
      }
      if (filters.store) {
        httpParams = httpParams.set('store', filters.store);
      }
      if (filters.quantity) {
        httpParams = httpParams.set('quantity', filters.quantity.toString());
      }
    }
    return this.httpClient.get<Shoppinglist[]>(this.shoppinglistUrl, {
      params: httpParams,
    });
  }

  getShoppinglistById(id: string): Observable<Shoppinglist> {
    return this.httpClient.get<Shoppinglist>(this.shoppinglistUrl + '/' + id);
  }


  //Filter all string type
  filterShoppinglists(shoppinglists: Shoppinglist[], filters: {
    productName?: string;
    store?: ShoppingStore;
    quantity?: number; }): Shoppinglist[] {

    let filteredShoppinglists = shoppinglists;

    // Filter by name
    if (filters.productName) {
      filters.productName = filters.productName.toLowerCase();

      // eslint-disable-next-line max-len
      filteredShoppinglists = filteredShoppinglists.filter(shoppinglist => shoppinglist.productName.toLowerCase().indexOf(filters.productName) !== -1);
    }
    // Filter by store
    if (filters.store) {
      filteredShoppinglists = filteredShoppinglists.filter(shoppinglist => shoppinglist.store.indexOf(filters.store) !== -1);
    }
    // Filter by threshold
    if (filters.quantity) {
      filteredShoppinglists = filteredShoppinglists.slice(0, filters.quantity);
    }

    return filteredShoppinglists;
  }

  addShoppinglist(newShoppinglist: Shoppinglist): Observable<string> {
    // Send post request to add a new shoppinglist with the shoppinglist data as the body.
    return this.httpClient.post<{id: string}>(this.shoppinglistUrl, newShoppinglist).pipe(map(res => res.id));
  }
}

