import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Shoppinglist, Category, ShoppingStore } from './shoppinglist';
import { map } from 'rxjs/operators';

@Injectable()
export class ShoppinglistService {
  readonly shoppinglistUrl: string = environment.apiUrl + 'shoppinglist';

  constructor(private httpClient: HttpClient) {
  }

  getShoppinglists(filters?: {
    name?: string;
    description: string;
    brand?: string;
    category?: Category;
    store?: ShoppingStore;
    location?: string;
    notes: string;
    tags?: string;
    lifespan?: number;
    threshold?: number; }): Observable<Shoppinglist[]> {

    let httpParams: HttpParams = new HttpParams();

    if (filters) {
      if (filters.name) {
        httpParams = httpParams.set('name', filters.name);
      }
      if (filters.brand) {
        httpParams = httpParams.set('brand', filters.brand);
      }
      if (filters.description) {
        httpParams = httpParams.set('description', filters.description);
      }
      if (filters.category) {
        httpParams = httpParams.set('category', filters.category);
      }
      if (filters.store) {
        httpParams = httpParams.set('store', filters.store);
      }
      if (filters.location) {
        httpParams = httpParams.set('location', filters.location);
      }
      if (filters.notes) {
        httpParams = httpParams.set('notes', filters.notes);
      }
      if (filters.tags) {
        httpParams = httpParams.set('tags', filters.tags);
      }
      if (filters.lifespan) {
        httpParams = httpParams.set('lifespan', filters.lifespan.toString());
      }
      if (filters.threshold) {
        httpParams = httpParams.set('threshold', filters.threshold.toString());
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
    name?: string;
    description?: string;
    brand?: string;
    category?: Category;
    store?: ShoppingStore;
    location?: string;
    notes?: string;
    tags?: string;
    lifespan?: number;
    threshold?: number; }): Shoppinglist[] {

    let filteredShoppinglists = shoppinglists;

    // Filter by name
    if (filters.name) {
      filters.name = filters.name.toLowerCase();

      filteredShoppinglists = filteredShoppinglists.filter(shoppinglist => shoppinglist.name.toLowerCase().indexOf(filters.name) !== -1);
    }
    // Filter by description
    if (filters.description) {
      filters.description = filters.description.toLowerCase();

      filteredShoppinglists = filteredShoppinglists
      .filter(shoppinglist => shoppinglist.description.toLowerCase().indexOf(filters.description) !== -1);
    }
    // Filter by brand
    if (filters.brand) {
      filters.brand = filters.brand.toLowerCase();

      filteredShoppinglists = filteredShoppinglists.filter(shoppinglist => shoppinglist.brand.toLowerCase().indexOf(filters.brand) !== -1);
    }
    // Filter by category
    if (filters.category) {
      filteredShoppinglists = filteredShoppinglists.filter(shoppinglist => shoppinglist.category.indexOf(filters.category) !== -1);
    }
    // Filter by store
    if (filters.store) {
      filteredShoppinglists = filteredShoppinglists.filter(shoppinglist => shoppinglist.store.indexOf(filters.store) !== -1);
    }
    // Filter by location
    if (filters.location) {
      filters.location = filters.location.toLowerCase();

      filteredShoppinglists = filteredShoppinglists
      .filter(shoppinglist => shoppinglist.location.toLowerCase().indexOf(filters.location) !== -1);
    }
    // Filter by notes
    if (filters.notes) {
      filters.notes = filters.notes.toLowerCase();

      filteredShoppinglists = filteredShoppinglists.filter(shoppinglist => shoppinglist.notes.toLowerCase().indexOf(filters.notes) !== -1);
    }
    // Filter by tags
    if (filters.tags) {
      filters.tags = filters.tags.toLowerCase();

      filteredShoppinglists = filteredShoppinglists.filter(shoppinglist => shoppinglist.tags.toLowerCase().indexOf(filters.tags) !== -1);
    }
    // Filter by lifespan
    if (filters.lifespan) {
      filteredShoppinglists = filteredShoppinglists.slice(0, filters.lifespan);
    }
    // Filter by threshold
    if (filters.threshold) {
      filteredShoppinglists = filteredShoppinglists.slice(0, filters.threshold);
    }

    return filteredShoppinglists;
  }

  addShoppinglist(newShoppinglist: Shoppinglist): Observable<string> {
    // Send post request to add a new shoppinglist with the shoppinglist data as the body.
    return this.httpClient.post<{id: string}>(this.shoppinglistUrl, newShoppinglist).pipe(map(res => res.id));
  }
}

