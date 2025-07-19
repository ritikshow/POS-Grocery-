import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintDesignVeiwComponent } from './print-design-veiw.component';

describe('PrintDesignVeiwComponent', () => {
  let component: PrintDesignVeiwComponent;
  let fixture: ComponentFixture<PrintDesignVeiwComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintDesignVeiwComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintDesignVeiwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
