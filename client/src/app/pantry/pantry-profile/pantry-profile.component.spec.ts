import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PantryProfileComponent } from './pantry-profile.component';

describe('PantryProfileComponent', () => {
  let component: PantryProfileComponent;
  let fixture: ComponentFixture<PantryProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PantryProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PantryProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
