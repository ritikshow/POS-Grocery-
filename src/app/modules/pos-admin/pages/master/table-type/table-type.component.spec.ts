import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableTypeComponent } from './table-type.component';

describe('TableTypeComponent', () => {
  let component: TableTypeComponent;
  let fixture: ComponentFixture<TableTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
