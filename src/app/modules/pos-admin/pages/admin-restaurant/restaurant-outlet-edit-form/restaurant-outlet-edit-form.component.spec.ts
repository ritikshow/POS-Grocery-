import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantOutletEditFormComponent } from './restaurant-outlet-edit-form.component';

describe('RestaurantOutletEditFormComponent', () => {
  let component: RestaurantOutletEditFormComponent;
  let fixture: ComponentFixture<RestaurantOutletEditFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestaurantOutletEditFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestaurantOutletEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
