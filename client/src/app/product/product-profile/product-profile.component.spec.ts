import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteStub } from '../../../testing/activated-route-stub';
import { MockProductService } from '../../../testing/product.service.mock';
import { Product } from '../product';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductProfileComponent } from './product-profile.component';
import { ProductService } from '../product.service';

describe('ProductProfileComponent', () => {
  let component: ProductProfileComponent;
  let fixture: ComponentFixture<ProductProfileComponent>;
  const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatCardModule
      ],
      declarations: [ProductProfileComponent, ProductCardComponent],
      providers: [
        { provide: ProductService, useValue: new MockProductService() },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to a specific product profile', () => {
    const expectedProduct: Product = MockProductService.testProducts[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `ProductProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedProduct._id });

    expect(component.id).toEqual(expectedProduct._id);
    expect(component.product).toEqual(expectedProduct);
  });

  it('should navigate to correct product when the id parameter changes', () => {
    let expectedProduct: Product = MockProductService.testProducts[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `ProductProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedProduct._id });

    expect(component.id).toEqual(expectedProduct._id);

    // Changing the paramMap should update the displayed product profile.
    expectedProduct = MockProductService.testProducts[1];
    activatedRoute.setParamMap({ id: expectedProduct._id });

    expect(component.id).toEqual(expectedProduct._id);
  });

  it('should have `null` for the product for a bad ID', () => {
    activatedRoute.setParamMap({ id: 'badID' });

    // If the given ID doesn't map to a product, we expect the service
    // to return `null`, so we would expect the component's product
    // to also be `null`.
    expect(component.id).toEqual('badID');
    expect(component.product).toBeNull();
  });
});
