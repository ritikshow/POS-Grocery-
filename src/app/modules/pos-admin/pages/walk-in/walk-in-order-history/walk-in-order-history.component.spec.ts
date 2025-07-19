import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalkInOrderHistoryComponent } from './walk-in-order-history.component';

describe('WalkInOrderHistoryComponent', () => {
  let component: WalkInOrderHistoryComponent;
  let fixture: ComponentFixture<WalkInOrderHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalkInOrderHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalkInOrderHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
