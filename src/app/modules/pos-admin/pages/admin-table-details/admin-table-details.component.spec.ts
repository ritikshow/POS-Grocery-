import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTableDetailsComponent } from './admin-table-details.component';

describe('AdminTableDetailsComponent', () => {
  let component: AdminTableDetailsComponent;
  let fixture: ComponentFixture<AdminTableDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminTableDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTableDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
