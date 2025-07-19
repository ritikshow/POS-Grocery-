import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreparedItemComponent } from './prepared-item.component';

describe('PreparedItemComponent', () => {
  let component: PreparedItemComponent;
  let fixture: ComponentFixture<PreparedItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreparedItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreparedItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
