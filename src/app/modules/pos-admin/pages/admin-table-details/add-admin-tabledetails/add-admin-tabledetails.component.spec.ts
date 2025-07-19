import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAdminTabledetailsComponent } from './add-admin-tabledetails.component';

describe('AddAdminTabledetailsComponent', () => {
  let component: AddAdminTabledetailsComponent;
  let fixture: ComponentFixture<AddAdminTabledetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAdminTabledetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAdminTabledetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
