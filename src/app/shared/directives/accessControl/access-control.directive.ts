import { Directive, Input, OnInit, ElementRef } from "@angular/core";
import { AuthService } from '@core/services/auth/auth.service';

@Directive({
    selector: "[accessControl]",
})

export class AccessControlDirective implements OnInit {
    @Input("moduleType") moduleType: string;

    constructor(
        private elementRef: ElementRef,
        private auth: AuthService
    ) { }

    ngOnInit() {
        this.elementRef.nativeElement.style.display = "none";
        this.checkAccessModule();
    }

    checkAccessModule() {
        let accessControls: any = this.auth.getAccessControls();

        if (accessControls) {
            let module: any = accessControls.find(access => access.code === this.moduleType);

            if (module) {
                this.elementRef.nativeElement.style.display = module ? "block" : "none";
            }
        }
    }
}