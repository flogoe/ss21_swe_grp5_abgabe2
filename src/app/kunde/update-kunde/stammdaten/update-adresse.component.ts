/* eslint-disable array-bracket-newline */
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Adresse } from '../../shared/kunde';
import type { OnInit } from '@angular/core';
import log from 'loglevel';

/**
 * Komponente mit dem Tag &lt;hs-update-adresse&gt;, um das Erfassungsformular
 * f&uuml;r ein neues Kunde zu realisieren.
 */
@Component({
    selector: 'hs-update-adresse',
    templateUrl: './update-adresse.component.html',
    styleUrls: ['./update-adresse.component.scss'],
})
export class UpdateAdresseComponent implements OnInit, AfterViewInit {
    @Input()
    form!: FormGroup;

    @Input()
    currentValue!: Adresse;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    readonly PLZ_LENGTH = 5;

    plz!: FormControl;

    ort!: FormControl;

    readonly adresseForm = new FormGroup({});

    // eslint-disable-next-line no-empty-function
    constructor(private readonly cd: ChangeDetectorRef) {}

    ngOnInit() {
        log.debug('UpdateAdresseComponent.ngOnInit', this.currentValue);
        // siehe formControlName innerhalb @Component({templateUrl: ...})

        this.plz = new FormControl(this.currentValue.plz, [
            Validators.required,
            Validators.minLength(this.PLZ_LENGTH),
            Validators.maxLength(this.PLZ_LENGTH),
        ]);

        this.ort = new FormControl(this.currentValue.ort, [
            Validators.required,
        ]);
        this.adresseForm.addControl('plz', this.plz);
        this.adresseForm.addControl('ort', this.ort);
        this.form.addControl('adresse', this.adresseForm);
    }

    ngAfterViewInit() {
        this.cd.markForCheck();
        this.cd.detectChanges();
    }
}
/* eslint-enable array-bracket-newline */
