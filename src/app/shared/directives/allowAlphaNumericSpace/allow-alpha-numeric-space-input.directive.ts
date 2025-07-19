import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[AllowAlphaNumericSpace]'
})
export class AllowAlphaNumericSpaceDirective {

    constructor(private el: ElementRef) { }
    regexStr = new RegExp(/^(?![\s-])[a-zA-Z0-9- ]*$/g)

    @Input() AllowAlphaNumeric: boolean;

    private specialKeys = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'];

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {

        if (this.specialKeys.indexOf(event.key) !== -1 ||

            (event.key == "a" && event.ctrlKey) ||

            (event.key == "c" && event.ctrlKey) ||

            (event.key === "v" && event.ctrlKey) ||

            (event.key == "x" && event.ctrlKey) ||

            (event.key >= "home" && event.key <= "Arrow Right")) {
            return;
        }


        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regexStr)) {
            event.preventDefault();
        }
    }
}
