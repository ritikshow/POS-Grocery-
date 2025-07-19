import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRegRestaurantComponent } from './user-reg-restaurant.component';

describe('UserRegRestaurantComponent', () => {
  let component: UserRegRestaurantComponent;
  let fixture: ComponentFixture<UserRegRestaurantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserRegRestaurantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRegRestaurantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
