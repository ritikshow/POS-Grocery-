import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintTableQrComponent } from './print-table-qr.component';

describe('PrintTableQrComponent', () => {
  let component: PrintTableQrComponent;
  let fixture: ComponentFixture<PrintTableQrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintTableQrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintTableQrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
