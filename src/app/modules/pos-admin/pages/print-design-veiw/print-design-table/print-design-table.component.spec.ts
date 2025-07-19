import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintDesignTableComponent } from './print-design-table.component';

describe('PrintDesignTableComponent', () => {
  let component: PrintDesignTableComponent;
  let fixture: ComponentFixture<PrintDesignTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintDesignTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintDesignTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
