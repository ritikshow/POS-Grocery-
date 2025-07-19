import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeTableComponent } from './merge-table.component';

describe('MergeTableComponent', () => {
  let component: MergeTableComponent;
  let fixture: ComponentFixture<MergeTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MergeTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
