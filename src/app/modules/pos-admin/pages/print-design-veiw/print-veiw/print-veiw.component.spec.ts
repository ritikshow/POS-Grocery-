import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintVeiwComponent } from './print-veiw.component';

describe('PrintVeiwComponent', () => {
  let component: PrintVeiwComponent;
  let fixture: ComponentFixture<PrintVeiwComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintVeiwComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintVeiwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
