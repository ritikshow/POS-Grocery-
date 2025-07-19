import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DinesInComponent } from './dines-in.component';

describe('DinesInComponent', () => {
  let component: DinesInComponent;
  let fixture: ComponentFixture<DinesInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DinesInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DinesInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
