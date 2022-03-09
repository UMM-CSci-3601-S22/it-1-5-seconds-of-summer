import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductCategory, ShoppingStore } from './product';
import { map } from 'rxjs/operators';

@Injectable()
export class ProductService {
  readonly productUrl: string = environment.apiUrl + 'product';

  constructor(private httpClient: HttpClient) {
  }

  getProducts(filters?: {
    name?: string;
    description: string;
    brand?: string;
    category?: ProductCategory;
    store?: ShoppingStore;
    location?: string;
    notes?: string;
    tags?: string;
    lifespan?: number;
    threshold?: number; }): Observable<Product[]> {

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
    return this.httpClient.get<Product[]>(this.productUrl, {
      params: httpParams,
    });
  }

  getProductById(id: string): Observable<Product> {
    return this.httpClient.get<Product>(this.productUrl + '/' + id);
  }


  //Filter all string type
  filterProducts(products: Product[], filters: {
    name?: string;
    description?: string;
    brand?: string;
    category?: ProductCategory;
    store?: ShoppingStore;
    location?: string;
    notes?: string;
    tags?: string;
    lifespan?: number;
    threshold?: number; }): Product[] {

    let filteredProducts = products;

    // Filter by name
    if (filters.name) {
      filters.name = filters.name.toLowerCase();

      filteredProducts = filteredProducts.filter(product => product.name.toLowerCase().indexOf(filters.name) !== -1);
    }
    // Filter by description
    if (filters.description) {
      filters.description = filters.description.toLowerCase();

      filteredProducts = filteredProducts.filter(product => product.description.toLowerCase().indexOf(filters.description) !== -1);
    }
    // Filter by brand
    if (filters.brand) {
      filters.brand = filters.brand.toLowerCase();

      filteredProducts = filteredProducts.filter(product => product.brand.toLowerCase().indexOf(filters.brand) !== -1);
    }
    // Filter by category
    if (filters.category) {
      filteredProducts = filteredProducts.filter(product => product.category.indexOf(filters.category) !== -1);
    }
    // Filter by store
    if (filters.store) {
      filteredProducts = filteredProducts.filter(product => product.store.indexOf(filters.store) !== -1);
    }
    // Filter by location
    if (filters.location) {
      filters.location = filters.location.toLowerCase();

      filteredProducts = filteredProducts.filter(product => product.location.toLowerCase().indexOf(filters.location) !== -1);
    }
    // Filter by notes
    if (filters.notes) {
      filters.notes = filters.notes.toLowerCase();

      filteredProducts = filteredProducts.filter(product => product.notes.toLowerCase().indexOf(filters.notes) !== -1);
    }
    // Filter by tags
    if (filters.tags) {
      filters.tags = filters.tags.toLowerCase();

      filteredProducts = filteredProducts.filter(product => product.tags.toLowerCase().indexOf(filters.tags) !== -1);
    }
    // Filter by lifespan
    if (filters.lifespan) {
      filteredProducts = filteredProducts.slice(0, filters.lifespan);
    }
    // Filter by threshold
    if (filters.threshold) {
      filteredProducts = filteredProducts.slice(0, filters.threshold);
    }

    return filteredProducts;
  }

  addProduct(newProduct: Product): Observable<string> {
    // Send post request to add a new product with the product data as the body.
    return this.httpClient.post<{id: string}>(this.productUrl, newProduct).pipe(map(res => res.id));
  }
}
