import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAdminRoleComponent } from './add-admin-role.component';

describe('AddAdminRoleComponent', () => {
  let component: AddAdminRoleComponent;
  let fixture: ComponentFixture<AddAdminRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAdminRoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAdminRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
