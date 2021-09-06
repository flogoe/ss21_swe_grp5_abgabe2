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
 * Komponente mit dem Tag &lt;hs-update-verlag&gt;, um das Erfassungsformular
 * f&uuml;r ein neues Buch zu realisieren.
 */
@Component({
    selector: 'hs-update-verlag',
    templateUrl: './update-verlag.component.html',
    styleUrls: ['./update-verlag.component.scss'],
})
export class UpdateVerlagComponent implements OnInit, AfterViewInit {
    @Input()
    form!: FormGroup;

    @Input()
    currentValue!: string;

    verlag!: FormControl;

    // eslint-disable-next-line no-empty-function
    constructor(private readonly cd: ChangeDetectorRef) {}

    ngOnInit() {
        log.debug('UpdateVerlagComponent.ngOnInit', this.currentValue);
        // siehe formControlName innerhalb @Component({templateUrl: ...})
        this.verlag = new FormControl(this.currentValue, [Validators.required]);
        this.form.addControl('verlag', this.verlag);
    }

    ngAfterViewInit() {
        this.cd.markForCheck();
        this.cd.detectChanges();
    }
}
