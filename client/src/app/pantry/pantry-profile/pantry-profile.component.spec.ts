import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteStub } from '../../../testing/activated-route-stub';
import { MockPantryService } from '../../../testing/pantry.service.mock';
import { Pantry } from '../pantry';
import { PantryCardComponent } from '../pantry-card/pantry-card.component';
import { PantryProfileComponent } from './pantry-profile.component';
import { PantryService } from '../pantry.service';

describe('PantryProfileComponent', () => {
  let component: PantryProfileComponent;
  let fixture: ComponentFixture<PantryProfileComponent>;
  const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatCardModule
      ],
      declarations: [PantryProfileComponent, PantryCardComponent],
      providers: [
        { provide: PantryService, useValue: new MockPantryService() },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PantryProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to a specific pantry profile', () => {
    const expectedPantry: Pantry = MockPantryService.testPantry[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `PantryProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedPantry._id });

    expect(component.id).toEqual(expectedPantry._id);
    expect(component.pantry).toEqual(expectedPantry);
  });

  it('should navigate to correct pantry when the id parameter changes', () => {
    let expectedPantry: Pantry = MockPantryService.testPantry[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `PantryProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedPantry._id });

    expect(component.id).toEqual(expectedPantry._id);

    // Changing the paramMap should update the displayed pantry profile.
    expectedPantry = MockPantryService.testPantry[1];
    activatedRoute.setParamMap({ id: expectedPantry._id });

    expect(component.id).toEqual(expectedPantry._id);
  });

  it('should have `null` for the pantry for a bad ID', () => {
    activatedRoute.setParamMap({ id: 'badID' });

    // If the given ID doesn't map to a pantry, we expect the service
    // to return `null`, so we would expect the component's pantry
    // to also be `null`.
    expect(component.id).toEqual('badID');
    expect(component.pantry).toBeNull();
  });
});
