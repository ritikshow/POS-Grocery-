
import { Directive, Renderer2, ElementRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, DefaultValueAccessor } from '@angular/forms';

const UPPERCASE_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => UppercaseInputDirective),
  multi: true,
};

@Directive({
  selector: 'input[UpperCaseInput]',
  host: {
    // When the user updates the input
    '(input)': 'onInput($event.target.value)',
    '(blur)': 'onTouched()',
  },
  providers: [
    UPPERCASE_INPUT_CONTROL_VALUE_ACCESSOR,
  ],
})
export class UppercaseInputDirective extends DefaultValueAccessor {

  constructor(renderer: Renderer2, elementRef: ElementRef) {
    super(renderer, elementRef, false);
  }

  writeValue(value: any): void {
    const transformed = this.transformValue(value);

    super.writeValue(transformed);
  }

  onInput(value: any): void {
    const transformed = this.transformValue(value);

    super.writeValue(transformed);
    this.onChange(transformed);
  }

  private transformValue(value: any): any {
    const result = value && typeof value === 'string'
      ? value.toUpperCase()
      : value;

    return result;
  }
}