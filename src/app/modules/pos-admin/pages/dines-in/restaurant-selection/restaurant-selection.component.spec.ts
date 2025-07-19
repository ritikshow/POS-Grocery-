import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantSelectionComponent } from './restaurant-selection.component';

describe('RestaurantSelectionComponent', () => {
  let component: RestaurantSelectionComponent;
  let fixture: ComponentFixture<RestaurantSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestaurantSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestaurantSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
