import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBatchItemComponent } from './add-batch-item.component';

describe('CategoryComponent', () => {
  let component: AddBatchItemComponent;
  let fixture: ComponentFixture<AddBatchItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBatchItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBatchItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
