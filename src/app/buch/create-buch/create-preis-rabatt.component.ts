import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

// eslint-disable-next-line @typescript-eslint/no-duplicate-imports
import { FormGroup } from '@angular/forms';
import type { OnInit } from '@angular/core';
import log from 'loglevel';

/**
 * Komponente mit dem Tag &lt;hs-create-preisrabatt&gt;, um das Erfassungsformular
 * f&uuml;r ein neues Buch zu realisieren.
 */
@Component({
    selector: 'hs-create-preisrabatt',
    templateUrl: './create-preis-rabatt.component.html',
    styleUrls: ['./create-preis-rabatt.component.scss'],
})
export class CreatePreisRabattComponent implements OnInit, AfterViewInit {
    @Input()
    form!: FormGroup;

    // eslint-disable-next-line @typescript-eslint/naming-convention

    readonly preis = new FormControl(undefined, [Validators.required]);

    readonly rabatt = new FormControl(undefined, [Validators.required]);

    readonly preisrabattForm = new FormGroup({});

    // eslint-disable-next-line no-empty-function
    constructor(private readonly cd: ChangeDetectorRef) {}

    ngOnInit() {
        log.debug('CreatePreisRabattComponent.ngOnInit');
        // siehe formControlName innerhalb @Component({templateUrl: ...})
        this.preisrabattForm.addControl('preis', this.preis);
        this.preisrabattForm.addControl('rabatt', this.rabatt);
        this.form.addControl('preisrabatt', this.preisrabattForm);
    }

    ngAfterViewInit() {
        this.cd.markForCheck();
        this.cd.detectChanges();
    }
}
