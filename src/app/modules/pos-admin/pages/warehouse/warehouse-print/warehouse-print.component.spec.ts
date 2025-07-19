import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehousePrintComponent } from './warehouse-print.component';

describe('WarehousePrintComponent', () => {
  let component: WarehousePrintComponent;
  let fixture: ComponentFixture<WarehousePrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehousePrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehousePrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
