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
 * Komponente mit dem Tag &lt;hs-create-adresse&gt;, um das Erfassungsformular
 * f&uuml;r ein neues Kunde zu realisieren.
 */
@Component({
    selector: 'hs-create-adresse',
    templateUrl: './create-adresse.component.html',
    styleUrls: ['./create-adresse.component.scss'],
})
export class CreateAdresseComponent implements OnInit, AfterViewInit {
    @Input()
    form!: FormGroup;

    readonly plz = new FormControl(undefined, [Validators.required]);

    readonly ort = new FormControl(undefined, [Validators.required]);
    // eslint-disable-next-line no-useless-constructor
    constructor(private readonly cd: ChangeDetectorRef) {}

    ngOnInit() {
        log.debug('CreateAdresseComponent.ngOnInit');
        // siehe formControlName innerhalb @Component({templateUrl: ...})
        this.form.addControl('plz', this.plz);
        this.form.addControl('ort', this.ort);
    }

    ngAfterViewInit() {
        this.cd.markForCheck();
        this.cd.detectChanges();
    }
}
