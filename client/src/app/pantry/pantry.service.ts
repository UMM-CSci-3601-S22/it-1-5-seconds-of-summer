import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pantry } from './pantry';
import { map } from 'rxjs/operators';

@Injectable()
export class PantryService {
  readonly pantryUrl: string = environment.apiUrl + 'pantrys';

  constructor(private httpClient: HttpClient) {
  }

  getPantrys(filters?: {
    product?: string;
    purchaseDate?: string;
    tags: string;
    notes: string; }): Observable<Pantry[]> {

    let httpParams: HttpParams = new HttpParams();

    if (filters) {
      if (filters.product) {
        httpParams = httpParams.set('product', filters.product);
      }
      if (filters.purchaseDate) {
        httpParams = httpParams.set('purchaseDate', filters.purchaseDate);
      }
      if (filters.tags) {
        httpParams = httpParams.set('tags', filters.tags);
      }
      if (filters.notes) {
        httpParams = httpParams.set('notes', filters.notes);
      }
    }
    return this.httpClient.get<Pantry[]>(this.pantryUrl, {
      params: httpParams,
    });
  }

  getPantryById(id: string): Observable<Pantry> {
    return this.httpClient.get<Pantry>(this.pantryUrl + '/' + id);
  }



  filterPantrys(pantrys: Pantry[], filters: {
    product?: string;
    purchaseDate?: string;
    tags: string;
    notes: string; }): Pantry[] {

    let filteredPantrys = pantrys;

    // Filter by product
    if (filters.product) {
      filters.product = filters.product.toLowerCase();

      filteredPantrys = filteredPantrys.filter(pantry => pantry.product.toLowerCase().indexOf(filters.product) !== -1);
    }
    // Filter by purchaseDate
    if (filters.purchaseDate) {
      filters.purchaseDate = filters.purchaseDate.toLowerCase();

      filteredPantrys = filteredPantrys.filter(pantry => pantry.purchaseDate.toLowerCase().indexOf(filters.purchaseDate) !== -1);
    }
    // Filter by tags
    if (filters.tags) {
      filters.tags = filters.tags.toLowerCase();

      filteredPantrys = filteredPantrys.filter(pantry => pantry.tags.toLowerCase().indexOf(filters.tags) !== -1);
    }
    // Filter by notes
    if (filters.notes) {
      filteredPantrys = filteredPantrys.filter(pantry => pantry.notes.indexOf(filters.notes) !== -1);
    }

    return filteredPantrys;
  }

  addPantry(newPantry: Pantry): Observable<string> {
    // Send post request to add a new pantry with the pantry data as the body.
    return this.httpClient.post<{id: string}>(this.pantryUrl, newPantry).pipe(map(res => res.id));
  }
}
