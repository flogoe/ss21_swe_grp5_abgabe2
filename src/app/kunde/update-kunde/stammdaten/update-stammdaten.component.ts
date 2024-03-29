/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

import { Component, Input } from '@angular/core';
import type { FamilienstandType, GeschlechtType, Kunde } from '../../shared';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { KundeService, UpdateError } from '../../shared';

import { Adresse } from '../../shared/kunde';
import { FormGroup } from '@angular/forms';
import { HOME_PATH } from '../../../shared';
import type { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import log from 'loglevel';

/**
 * Komponente f&uuml;r das Tag <code>hs-update-stammdaten</code>
 */
@Component({
    selector: 'hs-update-stammdaten',
    templateUrl: './update-stammdaten.component.html',
    styleUrls: ['./update-stammdaten.component.scss'],
})
export class UpdateStammdatenComponent implements OnInit {
    // <hs-update-stammdaten [kunde]="...">
    @Input()
    kunde!: Kunde;

    readonly form = new FormGroup({});

    errorMsg: string | undefined = undefined;

    constructor(
        private readonly kundeService: KundeService,
        private readonly router: Router,
    ) {
        log.debug('UpdateStammdatenComponent.constructor()');
    }

    /**
     * Das Formular als Gruppe von Controls initialisieren und mit den
     * Stammdaten des zu &auml;ndernden Kundes vorbelegen.
     */
    ngOnInit() {
        log.debug('UpdateStammdatenComponent.ngOnInit(): kunde=', this.kunde);
    }

    /**
     * Die aktuellen Stammdaten f&uuml;r das angezeigte Kunde-Objekt
     * zur&uuml;ckschreiben.
     * @return false, um das durch den Button-Klick ausgel&ouml;ste Ereignis
     *         zu konsumieren.
     */
    onUpdate() {
        if (this.form.pristine) {
            log.debug(
                'UpdateStammdatenComponent.onUpdate(): keine Aenderungen',
            );
            return;
        }

        const { nachname }: { nachname: string } = this.form.value;

        const { email }: { email: string } = this.form.value;

        const { adresse }: { adresse: Adresse } = this.form.value;

        const { familienstand }: { familienstand: FamilienstandType } =
            this.form.value;
        const {
            geschlechtType,
        }: { geschlechtType: GeschlechtType | '' | undefined } =
            this.form.value;
        const { geburtsdatum } = this.kunde;
        this.kunde.updateStammdaten(
            nachname,
            email,
            adresse,
            familienstand,
            geschlechtType,
            geburtsdatum,
        );
        log.debug('kunde=', this.kunde);

        const next = async (result: Kunde | UpdateError) => {
            if (result instanceof UpdateError) {
                this.handleError(result);
                return;
            }

            await this.router.navigate([HOME_PATH]);
        };
        this.kundeService.update(this.kunde).pipe(first()).subscribe({ next });

        // damit das (Submit-) Ereignis konsumiert wird und nicht an
        // uebergeordnete Eltern-Komponenten propagiert wird bis zum
        // Refresh der gesamten Seite
        return false;
    }

    private handleError(err: UpdateError) {
        const { statuscode } = err;
        log.debug(
            `UpdateStammdatenComponent.handleError(): statuscode=${statuscode}`,
        );

        switch (statuscode) {
            case HttpStatusCode.BadRequest: {
                const { cause } = err;
                // TODO Aufbereitung der Fehlermeldung: u.a. Anfuehrungszeichen
                this.errorMsg =
                    cause instanceof HttpErrorResponse
                        ? cause.error
                        : JSON.stringify(cause);
                break;
            }
            case HttpStatusCode.TooManyRequests:
                this.errorMsg =
                    'Zu viele Anfragen. Bitte versuchen Sie es später noch einmal.';
                break;
            case HttpStatusCode.GatewayTimeout:
                this.errorMsg = 'Ein interner Fehler ist aufgetreten.';
                log.error('Laeuft der Appserver? Port-Forwarding?');
                break;
            default:
                this.errorMsg = 'Ein unbekannter Fehler ist aufgetreten.';
                break;
        }

        log.debug(
            `UpdateStammdatenComponent.handleError(): errorMsg=${this.errorMsg}`,
        );
    }
}

/* eslint-enable object-curly-newline */
/* eslint-enable @typescript-eslint/no-unsafe-assignment */
