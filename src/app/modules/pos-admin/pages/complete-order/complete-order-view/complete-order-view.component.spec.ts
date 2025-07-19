import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteOrderViewComponent } from './complete-order-view.component';

describe('CompleteOrderViewComponent', () => {
  let component: CompleteOrderViewComponent;
  let fixture: ComponentFixture<CompleteOrderViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompleteOrderViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompleteOrderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
