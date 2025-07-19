import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAdminRoleComponent } from './view-admin-role.component';

describe('ViewAdminRoleComponent', () => {
  let component: ViewAdminRoleComponent;
  let fixture: ComponentFixture<ViewAdminRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAdminRoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAdminRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
