import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantOutletFormComponent } from './restaurant-outlet-form.component';

describe('RestaurantOutletFormComponent', () => {
  let component: RestaurantOutletFormComponent;
  let fixture: ComponentFixture<RestaurantOutletFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestaurantOutletFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestaurantOutletFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
