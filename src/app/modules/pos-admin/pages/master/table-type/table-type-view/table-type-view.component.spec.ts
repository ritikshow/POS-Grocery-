import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableTypeViewComponent } from './table-type-view.component';

describe('TableTypeViewComponent', () => {
  let component: TableTypeViewComponent;
  let fixture: ComponentFixture<TableTypeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableTypeViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableTypeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
