import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[numericwithdecimal]'
})

export class NumericwithDecimalDirective {

    @Input('decimals') decimals: number = 0;
    @Input('beforedecimals') beforedecimals: number = 0;

    private check(value: string, decimals: number, beforedecimals: number) {
        if (decimals <= 0) {
            return String(value).match(new RegExp(/^\d+$/));
        } else {
            let regExpString = "^\\s*((\\d{0," + beforedecimals + "}(\\.\\d{0," + decimals + "})?)|((\\d*(\\.\\d{1," + decimals + "}))))\\s*$";
            return String(value).match(new RegExp(regExpString));
        }
    }

    private specialKeys = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'];

    constructor(private el: ElementRef) {
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (this.specialKeys.indexOf(event.key) !== -1) {
            return;
        }


        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !this.check(next, this.decimals, this.beforedecimals)) {
            event.preventDefault();
        }
    }
}
