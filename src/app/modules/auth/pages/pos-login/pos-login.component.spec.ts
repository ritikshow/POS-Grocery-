import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PosLoginComponent } from './pos-login.component';

describe('PosLoginComponent', () => {
  let component: PosLoginComponent;
  let fixture: ComponentFixture<PosLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PosLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PosLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
