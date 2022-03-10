import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pantry } from './pantry';
import { map } from 'rxjs/operators';

@Injectable()
export class PantryService {
  readonly pantryUrl: string = environment.apiUrl + 'pantry';

  constructor(private httpClient: HttpClient) {
  }

  getPantrys(filters?: {
    name?: string;
    prodID?: string;
    date?: string; }): Observable<Pantry[]> {

    let httpParams: HttpParams = new HttpParams();

    if (filters) {
      if (filters.name) {
        httpParams = httpParams.set('name', filters.name);
      }
      if (filters.date) {
        httpParams = httpParams.set('date', filters.date);
      }
      if (filters.prodID) {
        httpParams = httpParams.set('prodID', filters.prodID);
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
    name?: string;
    date?: string;
    prodID?: string;}): Pantry[] {

    let filteredPantrys = pantrys;

    // Filter by productId
    if (filters.name) {
      filters.name = filters.name.toLowerCase();

      filteredPantrys = filteredPantrys.filter(pantry => pantry.name.toLowerCase().indexOf(filters.name) !== -1);
    }
    // Filter by purchaseDate
    if (filters.date) {
      filters.date = filters.date.toLowerCase();

      filteredPantrys = filteredPantrys.filter(pantry => pantry.date.toLowerCase().indexOf(filters.date) !== -1);
    }
    if (filters.prodID) {
      filters.prodID = filters.prodID.toLowerCase();

      filteredPantrys = filteredPantrys.filter(pantry => pantry.date.toLowerCase().indexOf(filters.prodID) !== -1);
    }

    return filteredPantrys;
  }

  addPantry(newPantry: Pantry): Observable<string> {
    // Send post request to add a new pantry with the pantry data as the body.
    return this.httpClient.post<{id: string}>(this.pantryUrl, newPantry).pipe(map(res => res.id));
  }
}
