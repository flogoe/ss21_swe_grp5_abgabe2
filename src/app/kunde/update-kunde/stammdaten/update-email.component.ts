import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import type { FormGroup } from '@angular/forms';
import type { OnInit } from '@angular/core';
import log from 'loglevel';

/**
 * Komponente mit dem Tag &lt;hs-update-email&gt;, um das Erfassungsformular
 * f&uuml;r ein neues Kunde zu realisieren.
 */
@Component({
    selector: 'hs-update-email',
    templateUrl: './update-email.component.html',
    styleUrls: ['./update-email.component.scss'],
})
export class UpdateEmailComponent implements OnInit, AfterViewInit {
    @Input()
    form!: FormGroup;

    @Input()
    currentValue!: string;

    email!: FormControl;

    // eslint-disable-next-line no-useless-constructor
    constructor(private readonly cd: ChangeDetectorRef) {}

    ngOnInit() {
        log.debug('UpdateEmailComponent.ngOnInit', this.currentValue);
        // siehe formControlName innerhalb @Component({templateUrl: ...})
        this.email = new FormControl(this.currentValue, [
            Validators.required,
            Validators.email,
        ]);
        this.form.addControl('email', this.email);
    }

    ngAfterViewInit() {
        this.cd.markForCheck();
        this.cd.detectChanges();
    }
}
