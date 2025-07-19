import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintDesignVeiwEditComponent } from './print-design-veiw-edit.component';

describe('PrintDesignVeiwEditComponent', () => {
  let component: PrintDesignVeiwEditComponent;
  let fixture: ComponentFixture<PrintDesignVeiwEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintDesignVeiwEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintDesignVeiwEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
