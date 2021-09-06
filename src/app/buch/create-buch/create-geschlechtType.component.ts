/*
 * Copyright (C) 2015 - present Juergen Zimmermann, Hochschule Karlsruhe
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
 * Komponente mit dem Tag &lt;hs-create-geschlechtType&gt;, um das Erfassungsformular
 * f&uuml;r ein neues Buch zu realisieren.
 */
@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hs-create-geschlechtType',
    templateUrl: './create-geschlechtType.component.html',
    styleUrls: ['./create-geschlechtType.component.scss'],
})
export class CreateGeschlechtTypeComponent implements OnInit {
    @Input()
    form!: FormGroup;

    readonly geschlecht = new FormControl(undefined, Validators.required);

    // eslint-disable-next-line no-empty-function
    constructor(private readonly cd: ChangeDetectorRef) {}

    ngOnInit() {
        log.debug('CreateGeschlechtTypeComponent.ngOnInit');
        // siehe formControlName innerhalb @Component({templateUrl: ...})
        this.form.addControl('geschlecht', this.geschlecht);
        this.cd.markForCheck();
        this.cd.detectChanges();
    }
}
