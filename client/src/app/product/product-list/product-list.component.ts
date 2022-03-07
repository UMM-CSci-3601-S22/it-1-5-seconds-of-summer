import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Product, ProductCategory, ShoppingStore } from '../product';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})

export class ProductListComponent implements OnInit, OnDestroy {

  public serverFilteredProducts: Product[];
  public filteredProducts: Product[];

  public productName: string;
  public productDescription: string;
  public productBrand: string;
  public productCategory: ProductCategory;
  public productStore: ShoppingStore;
  public productLocation: string;
  public productNotes: string;
  public productTags: string;
  public productLifespan: number;
  public productThreshold: number;
  getProductSub: Subscription;
  public viewType: 'card' | 'list' = 'card';

  constructor(private productService: ProductService) {

  }

  getProductsFromServer(): void {
    this.unsub();
    this.getProductSub = this.productService.getProducts({
      name: this.productName,
      description: this.productDescription,
      brand: this.productBrand,
      category: this.productCategory,
      store: this.productStore,
      location: this.productLocation,
      notes: this.productNotes,
      tags: this.productTags,
      lifespan: this.productLifespan,
      threshold: this.productThreshold
    }).subscribe(returnedProducts => {
      this.serverFilteredProducts = returnedProducts;
      this.updateFilter();
    }, err => {
      console.log(err);
    });
  }
  public updateFilter(): void {
    this.filteredProducts = this.productService.filterProducts(
      this.serverFilteredProducts, {
        name: this.productName,
        description: this.productDescription,
        brand: this.productBrand,
        category: this.productCategory,
        store: this.productStore,
        location: this.productLocation,
        notes: this.productNotes,
        tags: this.productTags,
        lifespan: this.productLifespan,
        threshold: this.productThreshold
      });
  }

  ngOnInit(): void {
    this.getProductsFromServer();
  }

  ngOnDestroy(): void {
    this.unsub();
  }

  unsub(): void {
    if (this.getProductSub) {
      this.getProductSub.unsubscribe();
    }
  }
}
