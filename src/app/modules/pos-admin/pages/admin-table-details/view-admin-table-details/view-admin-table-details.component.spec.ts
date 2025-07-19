import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAdminTableDetailsComponent } from './view-admin-table-details.component';

describe('ViewAdminTableDetailsComponent', () => {
  let component: ViewAdminTableDetailsComponent;
  let fixture: ComponentFixture<ViewAdminTableDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAdminTableDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAdminTableDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
