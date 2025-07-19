import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchItemComponent } from './batch-item.component';

describe('CompleteOrderComponent', () => {
  let component: BatchItemComponent;
  let fixture: ComponentFixture<BatchItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
