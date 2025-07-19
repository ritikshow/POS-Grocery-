import { Directive, Input, OnInit, ElementRef } from "@angular/core";
import { AuthService } from '@core/services/auth/auth.service';
import { StorageService, StorageKey } from "@core/services/common/storage.service";

@Directive({
    selector: "[actionControl]",
})

export class ActionControlDirective implements OnInit {
    @Input("moduleTyp") moduleTyp: string;
    @Input("accessType") accessType: string;
    currentUser: string;

    constructor(
        private elementRef: ElementRef,
        private auth: AuthService,
        private storageService: StorageService
    ) { }

    ngOnInit() {
        this.currentUser = this.storageService.getValue(StorageKey.currentUser);

        this.elementRef.nativeElement.style.display = "none";
        this.checkAccess();
    }

    checkAccess() {
        let accessControls: any = this.auth.getAccessControls();

        if (accessControls) {
            let module: any = accessControls.find(access => access.code === this.moduleTyp);

            if (module) {
                let action: any = module.actions.find(action => action.code === this.accessType && action.selected);
                if (action) {
                    this.elementRef.nativeElement.style.display = action ? "inline-block" : "none";
                }
            }
        }
    }
}