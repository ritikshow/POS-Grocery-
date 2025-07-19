import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAccessViewComponent } from './form-access-view.component';

describe('FormAccessViewComponent', () => {
  let component: FormAccessViewComponent;
  let fixture: ComponentFixture<FormAccessViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormAccessViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormAccessViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
