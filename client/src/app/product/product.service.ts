import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductCategory, ShoppingStore } from './product';
import { map } from 'rxjs/operators';

@Injectable()
export class ProductService {
  readonly productUrl: string = environment.apiUrl + 'products';

  constructor(private httpClient: HttpClient) {
  }

  getProducts(filters?: {
    productName?: string;
    description: string;
    brand?: string;
    category?: ProductCategory;
    store?: ShoppingStore;
    location?: string;
    notes?: string;
    tags?: string;
    lifespan?: number;
    threshold?: number;
  }): Observable<Product[]> {

    let httpParams: HttpParams = new HttpParams();

    if (filters) {
      if (filters.productName) {
        httpParams = httpParams.set('productName', filters.productName);
      }
      if (filters.store) {
        httpParams = httpParams.set('store', filters.store);
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
    productName?: string;
    description?: string;
    brand?: string;
    category?: ProductCategory;
    store?: ShoppingStore;
    location?: string;
    //notes?: string;
    //tags?: string;
    lifespan?: number;
    threshold?: number;
  }): Product[] {

    let filteredProducts = products;

    // Filter by name
    if (filters.productName) {
      filters.productName = filters.productName.toLowerCase();

      filteredProducts = filteredProducts.filter(product => product.productName.toLowerCase().indexOf(filters.productName) !== -1);
    }

    // // Filter by store
    if (filters.store) {
      filteredProducts = filteredProducts.filter(product => product.store.indexOf(filters.store) !== -1);
    }

    filteredProducts.slice(0, filters.lifespan);
    // }
    // Filter by threshold
    if (filters.threshold) {
      filteredProducts = filteredProducts.slice(0, filters.threshold);
    }

    return filteredProducts;
  }

  addProduct(newProduct: Product): Observable<string> {
    // Send post request to add a new product with the product data as the body.
    return this.httpClient.post<{ id: string }>(this.productUrl, newProduct).pipe(map(res => res.id));
  }
}
