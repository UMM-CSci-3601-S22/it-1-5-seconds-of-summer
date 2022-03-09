import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppinglistCardComponent } from './shoppinglist-card.component';

describe('ShoppinglistCardComponent', () => {
  let component: ShoppinglistCardComponent;
  let fixture: ComponentFixture<ShoppinglistCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShoppinglistCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppinglistCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
