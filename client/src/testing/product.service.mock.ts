import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product, ProductCategory, ShoppingStore } from '../app/product/product';
import { ProductService } from '../app/product/product.service';

/**
 * A "mock" version of the `ProductService` that can be used to test components
 * without having to create an actual service.
 */
@Injectable()
export class MockProductService extends ProductService {
  static testProducts: Product[] = [
    {
      _id: 'fried chicken_id',
      name: 'fried chicken',
      description: 'Delicious fried chicken legs and wings',
      brand: 'KFC',
      category: 'deli',
      store: 'willeys',
      location: 'UMM Student Center Store',
      notes: 'chicken',
      tags: 'fried',
      lifespan: 2,
      threshold: 23,
      image: null
    },
    {
      _id: 'roasted bread_id',
      name: 'Roasted Steak',
      description: 'Delicious roasted Bread',
      brand: 'SomeBread',
      category: 'bakery',
      store: 'pomme de terre food coop',
      location: 'UMM Student Center Store',
      notes: 'Bread',
      tags: 'Roasted',
      lifespan: 1,
      threshold: 15,
      image: null
    },
    {
      _id: 'chocolate cookies_id',
      name: 'Chocolate Cookies',
      description: 'Delicious chocolate cookies',
      brand: 'CookieCompany',
      category: 'desserts',
      store: 'pomme de terre food coop',
      location: 'UMM Student Center Store',
      notes: 'Cookie',
      tags: 'Chocolate',
      lifespan: 5,
      threshold: 43,
      image: null
    }
  ];

  constructor() {
    super(null);
  }

  getProducts(filters: {
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
    // Just return the test products regardless of what filters are passed in
    return of(MockProductService.testProducts);
  }

  getProductById(id: string): Observable<Product> {
    // If the specified ID is for the first test product,
    // return that product, otherwise return `null` so
    // we can test illegal product requests.
    if (id === MockProductService.testProducts[0]._id) {
      return of(MockProductService.testProducts[0]);
    } else {
      return of(null);
    }
  }

}
