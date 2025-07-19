import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableTypeFormComponent } from './table-type-form.component';

describe('TableTypeFormComponent', () => {
  let component: TableTypeFormComponent;
  let fixture: ComponentFixture<TableTypeFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableTypeFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
