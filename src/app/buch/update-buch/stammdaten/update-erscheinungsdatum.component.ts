/* eslint-disable array-bracket-newline */
/*
 * Copyright (C) 2018 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import type { FormGroup } from '@angular/forms';
import type { OnInit } from '@angular/core';
import log from 'loglevel';

/**
 * Komponente mit dem Tag &lt;hs-update-erscheinungsdatum&gt;, um das Erfassungsformular
 * f&uuml;r ein neues Buch zu realisieren.
 */
@Component({
    selector: 'hs-update-erscheinungsdatum',
    templateUrl: './update-erscheinungsdatum.component.html',
    styleUrls: ['./update-erscheinungsdatum.component.scss'],
})
export class UpdateErscheinungsdatumComponent implements OnInit {
    @Input()
    form!: FormGroup;

    @Input()
    currentValue!: Date | undefined;

    erscheinungsdatum!: FormControl;

    // eslint-disable-next-line no-empty-function
    constructor(private readonly cd: ChangeDetectorRef) {}

    ngOnInit() {
        log.debug('UpdateErscheinungsdatumComponent.ngOnInit');
        // siehe formControlName innerhalb @Component({templateUrl: ...})
        this.erscheinungsdatum = new FormControl(this.currentValue, [
            Validators.required,
        ]);

        this.form.addControl('erscheinungsdatum', this.erscheinungsdatum);
        this.cd.markForCheck();
        this.cd.detectChanges();
    }
}
/* eslint-enable array-bracket-newline */
