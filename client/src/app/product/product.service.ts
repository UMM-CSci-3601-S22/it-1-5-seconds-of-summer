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
    brand?: string;
    category?: ProductCategory;
    store?: ShoppingStore;
    location?: string;
    tags?: string;
    lifespan?: number;
    threshold?: number; }): Observable<Product[]> {

    let httpParams: HttpParams = new HttpParams();

    if (filters) {
      if (filters.brand) {
        httpParams = httpParams.set('brand', filters.brand);
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
  filterProducts(products: Product[], filters: { productName?: string; brand?: string; location?: string; tags?: string }): Product[] {

    let filteredProducts = products;

    // Filter by productName
    if (filters.productName) {
      filters.productName = filters.productName.toLowerCase();

      filteredProducts = filteredProducts.filter(product => product.productName.toLowerCase().indexOf(filters.productName) !== -1);
    }
    // Filter by brand
    if (filters.brand) {
      filters.brand = filters.brand.toLowerCase();

      filteredProducts = filteredProducts.filter(product => product.brand.toLowerCase().indexOf(filters.brand) !== -1);
    }
    // Filter by location
    if (filters.location) {
      filters.location = filters.location.toLowerCase();

      filteredProducts = filteredProducts.filter(product => product.location.toLowerCase().indexOf(filters.location) !== -1);
    }
    // Filter by tags
    if (filters.tags) {
      filters.tags = filters.tags.toLowerCase();

      filteredProducts = filteredProducts.filter(product => product.tags.toLowerCase().indexOf(filters.tags) !== -1);
    }

    return filteredProducts;
  }

  addProduct(newProduct: Product): Observable<string> {
    // Send post request to add a new product with the product data as the body.
    return this.httpClient.post<{id: string}>(this.productUrl, newProduct).pipe(map(res => res.id));
  }
}
