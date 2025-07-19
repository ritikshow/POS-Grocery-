import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantPermissionComponent } from './restaurant-permission.component';

describe('RestaurantPermissionComponent', () => {
  let component: RestaurantPermissionComponent;
  let fixture: ComponentFixture<RestaurantPermissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestaurantPermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestaurantPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
