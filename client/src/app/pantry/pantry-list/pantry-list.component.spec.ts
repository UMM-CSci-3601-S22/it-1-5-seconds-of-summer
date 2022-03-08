import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PantryListComponent } from './pantry-list.component';

describe('PantryListComponent', () => {
  let component: PantryListComponent;
  let fixture: ComponentFixture<PantryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PantryListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PantryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
