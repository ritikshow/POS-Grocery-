import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutletViewComponent } from './outlet-view.component';

describe('OutletViewComponent', () => {
  let component: OutletViewComponent;
  let fixture: ComponentFixture<OutletViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutletViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutletViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
