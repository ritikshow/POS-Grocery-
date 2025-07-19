import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalkInOrderComponent } from './walk-in-order.component';

describe('WalkInOrderComponent', () => {
  let component: WalkInOrderComponent;
  let fixture: ComponentFixture<WalkInOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalkInOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalkInOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
