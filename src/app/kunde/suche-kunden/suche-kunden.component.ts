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

import { FindError, KundeService } from '../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import type { Kunde, Suchkriterien } from '../shared';
import { first, tap } from 'rxjs/operators';

import { Component } from '@angular/core';
import { HttpStatusCode } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import log from 'loglevel';

/**
 * Komponente f&uuml;r das Tag <code>&lt;hs-suche-kunden&gt;</code>, die aus
 * den Kindkomponenten f&uuml;r diese Tags besteht:
 * <ul>
 *  <li> <code>hs-suchformular</code>
 *  <li> <code>hs-waiting</code>
 *  <li> <code>hs-gefundene-kunden</code>
 *  <li> <code>hs-error-message</code>
 * </ul>
 */
@Component({
    selector: 'hs-suche-kunden',
    templateUrl: './suche-kunden.component.html',
})
export class SucheKundenComponent implements OnInit {
    suchkriterien!: Suchkriterien;

    waiting = false;

    kunden: Kunde[] = [];

    errorMsg: string | undefined;

    // Wird von der JS-Engine aufgerufen
    constructor(
        private readonly kundeService: KundeService,
        private readonly titleService: Title,
    ) {
        log.debug('SucheKundenComponent.constructor()');
    }

    // Wird von Angular aufgerufen, wenn der DOM-Baum fertig ist,
    // d.h. nach dem "Rendering".
    // Wird immer generiert, wenn Angular-CLI genutzt wird.
    ngOnInit() {
        this.titleService.setTitle('Suche');
    }

    /**
     * Das Attribut <code>suchkriterien</code> wird auf den Wert des Ereignisses
     * <code>$suchkriterien</code> vom Typ Suchkriterien gesetzt. Diese Methode
     * wird aufgerufen, wenn in der Kindkomponente f&uuml;r
     * <code>hs-suchformular</code> das Ereignis ausgel&ouml;st wird.
     *
     * @param suchkriterien f&uuml;r die Suche.
     */
    suchen(suchkriterien: Suchkriterien) {
        log.debug(
            'SucheKundenComponent.suchen(): suchkriterien=',
            suchkriterien,
        );
        this.suchkriterien = suchkriterien;

        this.kunden = [];
        this.errorMsg = undefined;

        this.waiting = true;

        // Observable: mehrere Werte werden "lazy" bereitgestellt, statt in einem JSON-Array
        // pipe ist eine "pure" Funktion, die ein Observable in ein NEUES Observable transformiert
        this.kundeService
            .find(this.suchkriterien) // eslint-disable-line unicorn/no-array-callback-reference
            .pipe(
                tap(result => this.setProps(result)),
                first(),
            )
            .subscribe();
    }

    private setProps(result: Kunde[] | FindError) {
        this.waiting = false;

        if (result instanceof FindError) {
            this.handleError(result);
            return;
        }

        this.kunden = result;
        log.debug('SucheKundenComponent.setProps(): kunden=', this.kunden);
        this.errorMsg = undefined;
    }

    private handleError(err: FindError) {
        this.suchkriterien = {
            nachname: '',
            geschlechtType: '',
            familienstand: '',
            interessen: { sport: false, lesen: false, reisen: false },
        };
        this.kunden = [];

        const { statuscode } = err;
        log.debug(
            `SucheKundenComponent.handleError(): statuscode=${statuscode}`,
        );
        this.setErrorMsg(statuscode);
    }

    private setErrorMsg(statuscode: number) {
        switch (statuscode) {
            case HttpStatusCode.NotFound:
                this.errorMsg = 'Keine Bücher gefunden.';
                break;
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
            `SucheKundenComponent.setErrorMsg(): errorMsg=${this.errorMsg}`,
        );
    }
}
