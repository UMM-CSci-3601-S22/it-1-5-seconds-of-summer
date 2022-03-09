import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { MockProductService } from '../../../testing/product.service.mock';
import { Product } from '../product';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../product.service';
import { MatIconModule } from '@angular/material/icon';

const COMMON_IMPORTS: any[] = [
  FormsModule,
  MatCardModule,
  MatFormFieldModule,
  MatSelectModule,
  MatOptionModule,
  MatButtonModule,
  MatInputModule,
  MatExpansionModule,
  MatTooltipModule,
  MatListModule,
  MatDividerModule,
  MatRadioModule,
  MatIconModule,
  BrowserAnimationsModule,
  RouterTestingModule,
];

describe('Product list', () => {

  let productList: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [ProductListComponent, ProductCardComponent],
      // providers:    [ ProductService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{ provide: ProductService, useValue: new MockProductService() }]
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ProductListComponent);
      productList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('contains all the products', () => {
    expect(productList.serverFilteredProducts.length).toBe(3);
  });

  it('contains a product named \'Fried Chicken\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.name === 'Fried Chicken')).toBe(true);
  });

  it('contain a product named \'Roasted Steak\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.name === 'Roasted Steak')).toBe(true);
  });

  it('doesn\'t contain a product named \'Crazy Sandwich\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.name === 'Crazy Sandwich')).toBe(false);
  });//

  it('contain a description with \'chocolate cookies\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.description === 'chocolate cookies')).toBe(true);
  });

  it('doesn\'t contain a description \'not exist\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.description === 'not exist')).toBe(false);
  });

  it('contain a brand with \'SomeBread\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.brand === 'SomeBread')).toBe(true);
  });

  it('doesn\'t contain a brand \'Dongting Homemade\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.brand === 'Dongting Homemade')).toBe(false);
  });

  it('contain a category with \'deli\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.category === 'deli')).toBe(true);
  });

  it('doesn\'t contain a category with \'dry goods\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.category === 'dry goods')).toBe(false);
  });

  it('contain a store with \'willeys\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.store === 'willeys')).toBe(true);
  });

  it('doesn\'t contain a store with \'other\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.store === 'other')).toBe(false);
  });

  it('contain a location with \'Area A Row 1\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.location === 'Area A Row 1')).toBe(true);
  });

  it('doesn\'t contain a location with \'Not Exist\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.location === 'Not Exist')).toBe(false);
  });

  it('contain a notes with \'This is chocolate cookies, by CookieCompany\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) =>
    product.notes === 'This is chocolate cookies, by CookieCompany')).toBe(true);
  });

  it('doesn\'t contain a notes \'This is a test, which should not be exist\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) =>
    product.notes === 'This is a test, which should not be exist')).toBe(false);
  });

  it('contain a tags with \'fried\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.tags === 'fried')).toBe(true);
  });

  it('doesn\'t contain a tags with \'AHaha\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.tags === 'AHaha')).toBe(false);
  });

  it('contain a lifespan with 5', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.lifespan === 5)).toBe(true);
  });

  it('doesn\'t contain a lifespan with 200', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.lifespan === 200)).toBe(false);
  });

  it('contain a threshold with 23', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.threshold === 23)).toBe(true);
  });

  it('doesn\'t contain a threshold with 1800', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.threshold === 1800)).toBe(false);
  });
});

describe('Misbehaving Product List', () => {
  let productList: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  let productServiceStub: {
    getProducts: () => Observable<Product[]>;
    getProductsFiltered: () => Observable<Product[]>;
  };

  beforeEach(() => {
    // stub ProductService for test purposes
    productServiceStub = {
      getProducts: () => new Observable(observer => {
        observer.error('Error-prone observable');
      }),
      getProductsFiltered: () => new Observable(observer => {
        observer.error('Error-prone observable');
      })
    };

    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [ProductListComponent],
      // providers:    [ ProductService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{ provide: ProductService, useValue: productServiceStub }]
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ProductListComponent);
      productList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('generates an error if we don\'t set up a ProductListService', () => {
    // Since the observer throws an error, we don't expect products to be defined.
    expect(productList.serverFilteredProducts).toBeUndefined();
  });
});
