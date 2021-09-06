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
 * Komponente mit dem Tag &lt;hs-create-email&gt;, um das Erfassungsformular
 * f&uuml;r ein neues Buch zu realisieren.
 */
@Component({
    selector: 'hs-create-email',
    templateUrl: './create-email.component.html',
    styleUrls: ['./create-email.component.scss'],
})
export class CreateEmailComponent implements OnInit, AfterViewInit {
    @Input()
    form!: FormGroup;

    readonly email = new FormControl(undefined, [
        Validators.required,
        Validators.email,
    ]);

    // eslint-disable-next-line no-empty-function
    constructor(private readonly cd: ChangeDetectorRef) {}

    ngOnInit() {
        log.debug('CreateEmailComponent.ngOnInit');
        // siehe formControlName innerhalb @Component({templateUrl: ...})
        this.form.addControl('email', this.email);
    }

    ngAfterViewInit() {
        this.cd.markForCheck();
        this.cd.detectChanges();
    }
}
