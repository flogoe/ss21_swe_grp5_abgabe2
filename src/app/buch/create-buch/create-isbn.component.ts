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
 * Komponente mit dem Tag &lt;hs-create-isbn&gt;, um das Erfassungsformular
 * f&uuml;r ein neues Buch zu realisieren.
 */
@Component({
    selector: 'hs-create-isbn',
    templateUrl: './create-isbn.component.html',
    styleUrls: ['./create-isbn.component.scss'],
})
export class CreateIsbnComponent implements OnInit, AfterViewInit {
    @Input()
    form!: FormGroup;

    readonly isbn = new FormControl(undefined, [Validators.required]);

    // eslint-disable-next-line no-empty-function
    constructor(private readonly cd: ChangeDetectorRef) {}

    ngOnInit() {
        log.debug('CreateIsbnComponent.ngOnInit');
        // siehe formControlName innerhalb @Component({templateUrl: ...})
        this.form.addControl('isbn', this.isbn);
    }

    ngAfterViewInit() {
        this.cd.markForCheck();
        this.cd.detectChanges();
    }
}
