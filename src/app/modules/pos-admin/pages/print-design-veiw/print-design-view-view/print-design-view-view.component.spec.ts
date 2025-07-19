import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintDesignViewViewComponent } from './print-design-view-view.component';

describe('PrintDesignViewViewComponent', () => {
  let component: PrintDesignViewViewComponent;
  let fixture: ComponentFixture<PrintDesignViewViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintDesignViewViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintDesignViewViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
