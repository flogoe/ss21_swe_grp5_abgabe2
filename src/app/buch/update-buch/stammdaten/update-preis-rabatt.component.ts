/* eslint-disable array-bracket-newline */
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import type { OnInit } from '@angular/core';
import { PreisRabatt } from '../../shared/buch';
import log from 'loglevel';

/**
 * Komponente mit dem Tag &lt;hs-update-preisrabatt&gt;, um das Erfassungsformular
 * f&uuml;r ein neues Buch zu realisieren.
 */
@Component({
    selector: 'hs-update-preisrabatt',
    templateUrl: './update-preis-rabatt.component.html',
    styleUrls: ['./update-preis-rabatt.component.scss'],
})
export class UpdatePreisRabattComponent implements OnInit, AfterViewInit {
    @Input()
    form!: FormGroup;

    @Input()
    currentValue!: PreisRabatt;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    readonly PLZ_LENGTH = 5;

    preis!: FormControl;

    rabatt!: FormControl;

    readonly preisrabattForm = new FormGroup({});

    // eslint-disable-next-line no-empty-function
    constructor(private readonly cd: ChangeDetectorRef) {}

    ngOnInit() {
        log.debug('UpdatePreisRabattComponent.ngOnInit', this.currentValue);
        // siehe formControlName innerhalb @Component({templateUrl: ...})

        this.preis = new FormControl(this.currentValue.preis, [
            Validators.required,
        ]);

        this.rabatt = new FormControl(this.currentValue.rabatt, [
            Validators.required,
        ]);
        this.preisrabattForm.addControl('preis', this.preis);
        this.preisrabattForm.addControl('rabatt', this.rabatt);
        this.form.addControl('preisrabatt', this.preisrabattForm);
    }

    ngAfterViewInit() {
        this.cd.markForCheck();
        this.cd.detectChanges();
    }
}
/* eslint-enable array-bracket-newline */
