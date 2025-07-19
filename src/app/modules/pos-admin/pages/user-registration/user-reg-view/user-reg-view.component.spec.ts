import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRegViewComponent } from './user-reg-view.component';

describe('UserRegViewComponent', () => {
  let component: UserRegViewComponent;
  let fixture: ComponentFixture<UserRegViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserRegViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRegViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
