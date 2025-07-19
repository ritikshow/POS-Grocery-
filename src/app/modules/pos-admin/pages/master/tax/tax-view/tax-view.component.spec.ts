import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxViewComponent } from './tax-view.component';

describe('TaxViewComponent', () => {
  let component: TaxViewComponent;
  let fixture: ComponentFixture<TaxViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
