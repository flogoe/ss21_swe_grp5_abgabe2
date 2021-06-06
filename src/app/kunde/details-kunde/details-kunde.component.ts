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

import { ActivatedRoute, Router } from '@angular/router';
import { first, tap } from 'rxjs/operators';

// eslint-disable-next-line import/no-unresolved
import { BasicAuthService } from 'src/app/auth/basic-auth.service';
import { Component } from '@angular/core';
import { FindError } from './../shared/errors';
import { HttpStatusCode } from '@angular/common/http';
import type { Kunde } from '../shared';
import { KundeService } from '../shared';
import type { Observable } from 'rxjs';
import type { OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import log from 'loglevel';

/**
 * Komponente f&uuml;r das Tag <code>hs-details-kunde</code>
 */
@Component({
    selector: 'hs-details-kunde',
    templateUrl: './details-kunde.component.html',
    styleUrls: ['./details-kunde.component.scss'],
})
export class DetailsKundeComponent implements OnInit {
    waiting = true;

    kunde: Kunde | undefined;

    errorMsg: string | undefined;

    isAdmin!: boolean;

    appstate$!: Observable<Record<string, unknown> | undefined>;

    // eslint-disable-next-line max-params
    constructor(
        private readonly kundeService: KundeService,
        private readonly titleService: Title,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly authService: BasicAuthService,
    ) {
        log.debug('DetailsKundeComponent.constructor()');

        // getCurrentNavigation() liefert undefined innerhalb von ngOnInit
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras.state as { kunde: Kunde } | undefined;
        this.kunde = state?.kunde;
        log.debug(
            'DetailsKundeComponent.constructor(): this.kunde=',
            this.kunde,
        );
    }

    ngOnInit() {
        if (this.kunde === undefined) {
            log.debug(
                'DetailsKundeComponent.ngOnInit(): this.kunde === undefined',
            );

            // Pfad-Parameter aus /kunden/:id beobachten, ohne dass
            // bisher ein JavaScript-Ereignis, wie z.B. click, eingetreten ist.
            // UUID (oder Mongo-ID) ist ein String
            const id = this.route.snapshot.paramMap.get('id') ?? undefined;
            log.debug('DetailsKundeComponent.ngOnInit(): id=', id);

            this.kundeService
                .findById(id)
                .pipe(
                    tap(result => this.setProps(result)),
                    first(),
                )
                .subscribe();
        } else {
            this.waiting = false;
        }

        // Initialisierung, falls zwischenzeitlich der Browser geschlossen wurde
        this.isAdmin = this.authService.isAdmin;
    }

    private setProps(result: FindError | Kunde) {
        this.waiting = false;

        if (result instanceof FindError) {
            this.handleError(result);
            return;
        }

        this.kunde = result;
        this.errorMsg = undefined;

        const nachname = `Details ${this.kunde._id}`;
        this.titleService.setTitle(nachname);
    }

    private handleError(err: FindError) {
        const { statuscode } = err;
        log.debug(`DetailsComponent.handleError(): statuscode=${statuscode}`);

        this.kunde = undefined;

        switch (statuscode) {
            case HttpStatusCode.NotFound:
                this.errorMsg = 'Kein Kunde gefunden.';
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

        this.titleService.setTitle('Fehler');
    }
}
