import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAccessFormComponent } from './form-access-form.component';

describe('FormAccessFormComponent', () => {
  let component: FormAccessFormComponent;
  let fixture: ComponentFixture<FormAccessFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormAccessFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormAccessFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
