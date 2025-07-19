import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GRNComponent } from './grn.component';

describe('GRNComponent', () => {
  let component: GRNComponent;
  let fixture: ComponentFixture<GRNComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GRNComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GRNComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
