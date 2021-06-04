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

/* eslint-disable max-classes-per-file */

import { Component, Input } from '@angular/core';
import { KundeService, RemoveError } from '../../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { easeIn, easeOut } from '../../../shared';
import { first, tap } from 'rxjs/operators';

import { BasicAuthService } from 'src/app/auth/basic-auth.service';
import type { Kunde } from '../../shared';
import { NgLocalization } from '@angular/common';
import type { OnInit } from '@angular/core';
import { ROLLE_ADMIN } from '../../../auth/auth.service'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { Router } from '@angular/router'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { Subject } from 'rxjs';
import log from 'loglevel';

/**
 * Komponente f&uuml;r das Tag <code>hs-gefundene-kunden</code>, um zun&auml;chst
 * das Warten und danach das Ergebnis der Suche anzuzeigen, d.h. die gefundenen
 * B&uuml;cher oder eine Fehlermeldung.
 */
@Component({
    selector: 'hs-gefundene-kunden',
    templateUrl: './gefundene-kunden.component.html',
    animations: [easeIn, easeOut],
})
export class GefundeneKundenComponent implements OnInit {
    // Im ganzen Beispiel: lokale Speicherung des Zustands und nicht durch z.B.
    // eine Flux-Bibliothek wie beispielsweise Redux http://redux.js.org

    // Property Binding: <hs-gefundene-kunden [kunden]="...">
    // Decorator fuer ein Attribut. Siehe InputMetadata
    @Input()
    kunden: Kunde[] = [];

    isAdmin!: boolean;

    // nachtraegliches Einloggen mit der Rolle "admin" beobachten
    isAdmin$ = new Subject<boolean>();

    // Empfehlung: Konstruktor nur fuer DI
    constructor(
        private readonly kundeService: KundeService,
        private readonly router: Router,
        private readonly authService: BasicAuthService,
    ) {
        log.debug('GefundeneKundenComponent.constructor()');
    }

    // Attribute mit @Input() sind undefined im Konstruktor.
    // Methode zum "LifeCycle Hook" OnInit: wird direkt nach dem Konstruktor
    // aufgerufen.
    // Weitere Methoden zum Lifecycle: ngAfterViewInit(), ngAfterContentInit()
    // https://angular.io/docs/ts/latest/guide/cheatsheet.html
    // Die Ableitung vom Interface OnInit ist nicht notwendig, aber erleichtert
    // IntelliSense bei der Verwendung von TypeScript.
    ngOnInit() {
        log.debug('GefundeneKundenComponent.ngOnInit()');
        this.isAdmin = this.authService.isAdmin;

        this.authService.rollen$
            .pipe(
                tap((rollen: string[]) =>
                    // ein neues Observable vom Typ boolean
                    this.isAdmin$.next(rollen.includes(ROLLE_ADMIN)),
                ),
            )
            // das Subject von AuthService abonnieren bzw. beobachten
            .subscribe();
    }

    /**
     * Das ausgew&auml;hlte bzw. angeklickte Kunde in der Detailsseite anzeigen.
     * @param kunde Das ausgew&auml;hlte Kunde
     */
    onClick(kunde: Kunde) {
        log.debug('GefundeneKundenComponent.onClick(): kunde=', kunde);

        // Puffern im Singleton: eigentlich unnoetig
        this.kundeService.kunde = kunde;

        // URL mit der Kunde-ID, um ein Bookmark zu ermoeglichen
        // Gefundenes Kunde als NavigationExtras im Router puffern
        return this.router.navigate([kunde._id], { state: { kunde } });
    }

    /**
     * Das ausgew&auml;hlte bzw. angeklickte Kunde l&ouml;schen.
     * @param kunde Das ausgew&auml;hlte Kunde
     */
    onRemove(kunde: Kunde) {
        log.debug('GefundeneKundenComponent.onRemove(): kunde=', kunde);

        return this.kundeService
            .remove(kunde)
            .pipe(
                tap(result => {
                    if (result instanceof RemoveError) {
                        log.debug(
                            `GefundeneKundenComponent.onRemove(): statuscode=${result.statuscode}`,
                        );
                        return;
                    }

                    this.kunden = this.kunden.filter(b => b._id !== kunde._id);
                }),
                first(),
            )
            .subscribe();
    }
}

export class AnzahlLocalization extends NgLocalization {
    getPluralCategory(count: number) {
        return count === 1 ? 'single' : 'multi';
    }
}

/* eslint-enable max-classes-per-file */
