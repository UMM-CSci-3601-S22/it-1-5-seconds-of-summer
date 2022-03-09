import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppinglistProfileComponent } from './shoppinglist-profile.component';

describe('ShoppinglistProfileComponent', () => {
  let component: ShoppinglistProfileComponent;
  let fixture: ComponentFixture<ShoppinglistProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShoppinglistProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppinglistProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
