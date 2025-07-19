import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalkInCompleteOrderComponent } from './walk-in-complete-order.component';

describe('WalkInCompleteOrderComponent', () => {
  let component: WalkInCompleteOrderComponent;
  let fixture: ComponentFixture<WalkInCompleteOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalkInCompleteOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalkInCompleteOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
