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
 * Komponente mit dem Tag &lt;hs-update-geburtsdatum&gt;, um das Erfassungsformular
 * f&uuml;r ein neues Kunde zu realisieren.
 */
@Component({
    selector: 'hs-update-geburtsdatum',
    templateUrl: './update-geburtsdatum.component.html',
    styleUrls: ['./update-geburtsdatum.component.scss'],
})
export class UpdateGeburtsdatumComponent implements OnInit {
    @Input()
    form!: FormGroup;

    @Input()
    currentValue!: Date | undefined;

    geburtsdatum!: FormControl;

    // eslint-disable-next-line no-empty-function
    constructor(private readonly cd: ChangeDetectorRef) {}

    ngOnInit() {
        log.debug('UpdateGeburtsdatumComponent.ngOnInit');
        // siehe formControlName innerhalb @Component({templateUrl: ...})
        this.geburtsdatum = new FormControl(this.currentValue, [
            Validators.required,
        ]);

        this.form.addControl('geburtsdatum', this.geburtsdatum);
        this.cd.markForCheck();
        this.cd.detectChanges();
    }
}
/* eslint-enable array-bracket-newline */
